import express from 'express';
import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Waitlist from '../models/Waitlist.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

export const getPublicStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalPublishedEvents,
    upcomingEventsCount,
    pastEventsCount,
    totalOrganizers,
    totalRegistrations,
  ] = await Promise.all([
    Event.countDocuments({ status: 'Published' }),
    Event.countDocuments({ status: 'Published', startDate: { $gte: now } }),
    Event.countDocuments({ status: { $in: ['Published', 'Completed'] }, endDate: { $lt: now } }),
    User.countDocuments({ role: 'organizer', isActive: true }),
    Registration.countDocuments({ status: { $ne: 'Cancelled' } }),
  ]);

  res.json({
    totalEvents: totalPublishedEvents,
    upcomingEvents: upcomingEventsCount,
    pastEvents: pastEventsCount,
    totalOrganizers,
    totalRegistrations,
  });
});

export const getPublicEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search, category, type, isFree, period, sort = '-startDate' } = req.query;
  const now = new Date();

  const query = { status: 'Published' };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { eventCode: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (type) query.eventType = type;
  if (isFree !== undefined) query.isFree = isFree === 'true';

  if (period === 'upcoming') {
    query.startDate = { $gte: now };
  } else if (period === 'past') {
    query.endDate = { $lt: now };
  } else if (period === 'ongoing') {
    query.startDate = { $lte: now };
    query.endDate = { $gte: now };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('category', 'name icon color')
      .populate('organizer', 'fullName organization profileImage bio')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Event.countDocuments(query),
  ]);

  let registrationsMap = {};
  if (req.user && events.length > 0) {
    const eventIds = events.map((e) => e._id);
    const userRegs = await Registration.find({
      event: { $in: eventIds },
      $or: [
        ...(req.user.email ? [{ email: req.user.email }] : []),
        ...(req.user._id ? [{ participant: req.user._id }] : []),
      ],
      status: { $ne: 'Cancelled' },
    }).select('event registrationCode ticketNumber status');

    registrationsMap = userRegs.reduce((acc, r) => {
      acc[r.event.toString()] = {
        _id: r._id,
        registrationCode: r.registrationCode,
        ticketNumber: r.ticketNumber,
        status: r.status,
      };
      return acc;
    }, {});

    const waitlistedEventIds = eventIds.filter(
      (id) => !registrationsMap[id.toString()]
    );
    if (waitlistedEventIds.length > 0 && req.user.email) {
      const waitlistEntries = await Waitlist.find({
        event: { $in: waitlistedEventIds },
        email: req.user.email,
      }).select('event position');

      waitlistEntries.forEach((w) => {
        registrationsMap[w.event.toString()] = {
          status: 'Waitlisted',
          waitlistPosition: w.position,
        };
      });
    }
  }

  const eventsWithRegistration = events.map((e) => {
    const obj = e.toObject();
    obj.userRegistration = registrationsMap[e._id.toString()] || null;
    return obj;
  });

  res.json({
    events: eventsWithRegistration,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getPublicEventById = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: 'Published' })
    .populate('category', 'name icon color')
    .populate('organizer', 'fullName organization bio profileImage email phone');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  let userRegistration = null;
  if (req.user) {
    userRegistration = await Registration.findOne({
      event: event._id,
      $or: [
        ...(req.user.email ? [{ email: req.user.email }] : []),
        ...(req.user._id ? [{ participant: req.user._id }] : []),
      ],
      status: { $ne: 'Cancelled' },
    }).select('registrationCode ticketNumber status attendanceStatus');

    if (!userRegistration) {
      const waitlistEntry = await Waitlist.findOne({
        event: event._id,
        email: req.user.email,
      }).select('position createdAt');

      if (waitlistEntry) {
        userRegistration = {
          status: 'Waitlisted',
          waitlistPosition: waitlistEntry.position,
        };
      }
    }
  }

  res.json({ ...event.toObject(), userRegistration });
});

export const getPublicOrganizers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search } = req.query;
  const now = new Date();

  const matchStage = { role: 'organizer', isActive: true };
  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [organizers, total] = await Promise.all([
    User.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'events',
          let: { organizerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$organizer', '$$organizerId'] },
                status: 'Published',
              },
            },
            { $count: 'count' },
          ],
          as: 'publishedEvents',
        },
      },
      {
        $lookup: {
          from: 'events',
          let: { organizerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$organizer', '$$organizerId'] },
                status: 'Published',
                startDate: { $gte: now },
              },
            },
            { $count: 'count' },
          ],
          as: 'upcomingEvents',
        },
      },
      {
        $addFields: {
          publishedEventCount: {
            $ifNull: [{ $arrayElemAt: ['$publishedEvents.count', 0] }, 0],
          },
          upcomingEventCount: {
            $ifNull: [{ $arrayElemAt: ['$upcomingEvents.count', 0] }, 0],
          },
        },
      },
      {
        $project: {
          password: 0,
          resetToken: 0,
          resetTokenExpiry: 0,
          emailVerifyToken: 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]),
    User.countDocuments(matchStage),
  ]);

  res.json({
    organizers,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getPublicOrganizerById = asyncHandler(async (req, res) => {
  const organizer = await User.findOne({
    _id: req.params.id,
    role: 'organizer',
    isActive: true,
  }).select('-password -resetToken -resetTokenExpiry -emailVerifyToken');

  if (!organizer) {
    res.status(404);
    throw new Error('Organizer not found');
  }

  const events = await Event.find({ organizer: organizer._id, status: 'Published' })
    .populate('category', 'name icon color')
    .sort('-startDate');

  res.json({ organizer, events });
});

router.get('/stats', getPublicStats);
router.get('/events', optionalAuth, getPublicEvents);
router.get('/events/:id', optionalAuth, getPublicEventById);
router.get('/organizers', getPublicOrganizers);
router.get('/organizers/:id', getPublicOrganizerById);

export default router;
