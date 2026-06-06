import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import { generateSystemOverviewPDF, generateAttendanceReportPDF } from '../utils/pdfGenerator.js';

export const getSystemSummary = asyncHandler(async (req, res) => {
  const [
    totalEvents,
    totalRegistrations,
    totalUsers,
    totalParticipants,
    totalOrganizers,
    activeEvents,
    upcomingEvents,
  ] = await Promise.all([
    Event.countDocuments(),
    Registration.countDocuments({ status: { $ne: 'Cancelled' } }),
    User.countDocuments(),
    User.countDocuments({ role: 'participant' }),
    User.countDocuments({ role: 'organizer' }),
    Event.countDocuments({ status: 'Published' }),
    Event.countDocuments({ 
      status: 'Published',
      startDate: { $gte: new Date() }
    }),
  ]);
  
  const eventsByStatus = await Event.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const eventsByStatusObj = eventsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  res.json({
    totalEvents,
    totalRegistrations,
    totalUsers,
    totalParticipants,
    totalOrganizers,
    activeEvents,
    upcomingEvents,
    eventsByStatus: eventsByStatusObj,
  });
});

export const getEventSummary = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  const [total, confirmed, waitlisted, cancelled, present, absent, pending] = await Promise.all([
    Registration.countDocuments({ event: eventId }),
    Registration.countDocuments({ event: eventId, status: 'Confirmed' }),
    Registration.countDocuments({ event: eventId, status: 'Waitlisted' }),
    Registration.countDocuments({ event: eventId, status: 'Cancelled' }),
    Registration.countDocuments({ event: eventId, attendanceStatus: 'Present' }),
    Registration.countDocuments({ event: eventId, attendanceStatus: 'Absent' }),
    Registration.countDocuments({ event: eventId, attendanceStatus: 'Pending' }),
  ]);
  
  const attendanceRate = confirmed > 0 ? ((present / confirmed) * 100).toFixed(1) : 0;
  
  res.json({
    event: {
      _id: event._id,
      title: event.title,
      eventCode: event.eventCode,
      startDate: event.startDate,
      endDate: event.endDate,
      maxCapacity: event.maxCapacity,
      currentRegistrations: event.currentRegistrations,
      status: event.status,
      isFree: event.isFree,
      ticketPrice: event.ticketPrice,
    },
    total,
    confirmed,
    waitlisted,
    cancelled,
    present,
    absent,
    pending,
    attendanceRate,
  });
});

export const getRegistrationsByMonth = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const data = await Registration.aggregate([
    { $match: { registrationDate: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$registrationDate' },
          month: { $month: '$registrationDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = data.map(item => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    count: item.count,
  }));
  
  res.json(result);
});

export const getEventsByCategory = asyncHandler(async (req, res) => {
  const data = await Event.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        registrations: { $sum: '$currentRegistrations' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $project: {
        name: '$categoryInfo.name',
        icon: '$categoryInfo.icon',
        color: '$categoryInfo.color',
        count: 1,
        registrations: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
  
  res.json(data);
});

export const getTopEvents = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const events = await Event.find({ status: { $in: ['Published', 'Completed'] } })
    .sort('-currentRegistrations')
    .limit(limit)
    .select('title eventCode currentRegistrations maxCapacity startDate')
    .populate('category', 'name icon color');
  
  res.json(events);
});

export const getOrganizerStats = asyncHandler(async (req, res) => {
  const [totalEvents, totalRegistrations, upcomingEvents, events] = await Promise.all([
    Event.countDocuments({ organizer: req.user._id }),
    Registration.countDocuments({ 
      event: { $in: await Event.find({ organizer: req.user._id }).distinct('_id') },
      status: { $ne: 'Cancelled' }
    }),
    Event.countDocuments({ 
      organizer: req.user._id,
      status: 'Published',
      startDate: { $gte: new Date() }
    }),
    Event.find({ organizer: req.user._id })
      .populate('category', 'name icon')
      .sort('-createdAt')
      .limit(5),
  ]);
  
  // Calculate average attendance
  const completedEvents = await Event.find({ 
    organizer: req.user._id, 
    status: 'Completed' 
  });
  
  let totalAttendanceRate = 0;
  let eventCount = 0;
  
  for (const event of completedEvents) {
    const total = await Registration.countDocuments({ event: event._id, status: 'Confirmed' });
    const present = await Registration.countDocuments({ event: event._id, attendanceStatus: 'Present' });
    if (total > 0) {
      totalAttendanceRate += (present / total) * 100;
      eventCount++;
    }
  }
  
  const avgAttendance = eventCount > 0 ? (totalAttendanceRate / eventCount).toFixed(1) : 0;
  
  res.json({
    totalEvents,
    totalRegistrations,
    upcomingEvents,
    avgAttendance,
    recentEvents: events,
  });
});

export const exportSystemOverview = asyncHandler(async (req, res) => {
  const [totalEvents, totalRegistrations, totalUsers, events] = await Promise.all([
    Event.countDocuments(),
    Registration.countDocuments(),
    User.countDocuments(),
    Event.find().sort('-currentRegistrations').limit(5).select('title currentRegistrations'),
  ]);
  
  const eventsByStatus = await Event.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const eventsByStatusObj = eventsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  const data = {
    totalEvents,
    totalRegistrations,
    totalUsers,
    eventsByStatus: eventsByStatusObj,
    topEvents: events,
  };
  
  const pdfBuffer = await generateSystemOverviewPDF(data);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=system-overview.pdf');
  res.send(pdfBuffer);
});

export const exportEventReport = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  const registrations = await Registration.find({ event: eventId, status: 'Confirmed' });
  const pdfBuffer = await generateAttendanceReportPDF(event, registrations);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=event-report-${event.eventCode}.pdf`);
  res.send(pdfBuffer);
});
