import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Waitlist from '../models/Waitlist.js';
import AuditLog from '../models/AuditLog.js';

const generateEventCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `EVT-${year}-`;
  
  const lastEvent = await Event.findOne({ eventCode: new RegExp(`^${prefix}`) })
    .sort({ eventCode: -1 })
    .limit(1);
  
  let sequence = 1;
  if (lastEvent) {
    const lastSequence = parseInt(lastEvent.eventCode.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(5, '0')}`;
};

const logAction = async (req, action, targetModel, targetId, details) => {
  try {
    await AuditLog.create({
      performedBy: req.user?._id,
      action,
      targetModel,
      targetId,
      details,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

export const createEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body, createdBy: req.user._id, organizer: req.user._id };
  
  if (eventData.tags && typeof eventData.tags === 'string') {
    eventData.tags = eventData.tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  
  if (eventData.isFree) {
    eventData.ticketPrice = 0;
  }
  
  eventData.eventCode = await generateEventCode();
  
  // Validate required fields for publishing
  if (eventData.status === 'Published') {
    if (!eventData.title || !eventData.description || !eventData.category || 
        !eventData.startDate || !eventData.endDate || !eventData.location || 
        !eventData.maxCapacity) {
      res.status(400);
      throw new Error('Missing required fields for publishing');
    }
  }
  
  const event = await Event.create(eventData);
  await logAction(req, 'EVENT_CREATED', 'Event', event._id, `Event ${event.title} created`);
  
  res.status(201).json(event);
});

export const getEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search, category, status, eventType, isFree, sort = '-createdAt' } = req.query;

  const query = {};

  // Public users only see published events
  if (!req.user || req.user.role === 'participant') {
    query.status = 'Published';
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { eventCode: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (status) query.status = status;
  if (eventType) query.eventType = eventType;
  if (isFree !== undefined) query.isFree = isFree === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('category', 'name icon color')
      .populate('organizer', 'fullName organization')
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

export const getMyEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, status } = req.query;
  const query = { organizer: req.user._id };
  if (status) query.status = status;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('category', 'name icon color')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Event.countDocuments(query),
  ]);
  
  res.json({
    events,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getAdminEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search, status, category } = req.query;
  const query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { eventCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (category) query.category = category;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('category', 'name icon color')
      .populate('organizer', 'fullName organization email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Event.countDocuments(query),
  ]);
  
  res.json({
    events,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('category', 'name icon color')
    .populate('organizer', 'fullName organization bio profileImage');

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

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Ownership check
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }
  
  // Cannot reduce capacity below current registrations
  if (req.body.maxCapacity && req.body.maxCapacity < event.currentRegistrations) {
    res.status(400);
    throw new Error(`Cannot reduce capacity below current registrations (${event.currentRegistrations})`);
  }
  
  Object.assign(event, req.body);
  if (event.isFree) event.ticketPrice = 0;
  await event.save();
  
  await logAction(req, 'EVENT_UPDATED', 'Event', event._id, `Event ${event.title} updated`);
  
  res.json(event);
});

export const publishEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  // Validate required fields
  if (!event.title || !event.description || !event.category || 
      !event.startDate || !event.endDate || !event.location || 
      !event.maxCapacity) {
    res.status(400);
    throw new Error('Cannot publish: missing required fields');
  }
  
  event.status = 'Published';
  await event.save();
  
  await logAction(req, 'EVENT_PUBLISHED', 'Event', event._id, `Event ${event.title} published`);
  
  res.json(event);
});

export const cancelEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  const { reason } = req.body;
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  event.status = 'Cancelled';
  event.cancellationReason = reason || 'No reason provided';
  await event.save();
  
  await logAction(req, 'EVENT_CANCELLED', 'Event', event._id, `Event ${event.title} cancelled: ${reason}`);
  
  res.json(event);
});

export const completeEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  event.status = 'Completed';
  await event.save();
  
  await logAction(req, 'EVENT_COMPLETED', 'Event', event._id, `Event ${event.title} marked as completed`);
  
  res.json(event);
});

export const uploadBanner = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  if (req.file) {
    event.bannerImage = `/uploads/${req.file.filename}`;
    await event.save();
  }
  
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can delete events');
  }
  
  event.status = 'Cancelled';
  event.cancellationReason = 'Deleted by admin';
  await event.save();
  
  await logAction(req, 'EVENT_DELETED', 'Event', event._id, `Event ${event.title} soft-deleted`);
  
  res.json({ message: 'Event deleted' });
});
