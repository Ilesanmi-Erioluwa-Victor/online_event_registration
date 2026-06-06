import asyncHandler from 'express-async-handler';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Waitlist from '../models/Waitlist.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateRegistrationCode, generateTicketNumber } from '../utils/generateRegCode.js';
import { generateTicketPDF, generateParticipantListPDF, generateAttendanceReportPDF } from '../utils/pdfGenerator.js';
import { sendEmail, sendBulkEmail } from '../config/email.js';

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

const sendCapacityAlert = async (event) => {
  try {
    const fillPercentage = (event.currentRegistrations / event.maxCapacity) * 100;
    if (fillPercentage >= 80 && !event.alert80Sent) {
      const organizer = await User.findById(event.organizer);
      if (organizer) {
        await sendEmail({
          to: organizer.email,
          subject: `${event.title} is 80% full!`,
          html: `
            <h2>Capacity Alert</h2>
            <p>Your event <strong>${event.title}</strong> has reached 80% of its capacity.</p>
            <p>Current registrations: ${event.currentRegistrations} / ${event.maxCapacity}</p>
            ${event.allowWaitlist ? '<p>Waitlist is enabled for this event.</p>' : ''}
          `,
        });
        event.alert80Sent = true;
        await event.save();
      }
    }
    if (event.currentRegistrations >= event.maxCapacity) {
      const organizer = await User.findById(event.organizer);
      if (organizer) {
        await sendEmail({
          to: organizer.email,
          subject: `${event.title} is now fully booked!`,
          html: `
            <h2>Event Fully Booked</h2>
            <p>Your event <strong>${event.title}</strong> has reached maximum capacity.</p>
            <p>Total registrations: ${event.currentRegistrations} / ${event.maxCapacity}</p>
          `,
        });
      }
    }
  } catch (err) {
    console.error('Capacity alert error:', err);
  }
};

export const createRegistration = asyncHandler(async (req, res) => {
  const { eventId, fullName, email, phone, organization, customFieldValues } = req.body;
  
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Business rules
  if (event.status !== 'Published') {
    res.status(400);
    throw new Error('Event is not open for registration');
  }
  
  if (new Date() > new Date(event.registrationDeadline)) {
    res.status(400);
    throw new Error('Registration deadline has passed');
  }
  
  // Check if organizer is trying to register
  if (req.user && event.organizer.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Organizers cannot register for their own event');
  }
  
  // Check for duplicate registration
  const existingQuery = { event: eventId, email };
  if (req.user) existingQuery.participant = req.user._id;
  
  const existing = await Registration.findOne({
    event: eventId,
    $or: [
      { email, status: { $ne: 'Cancelled' } },
      req.user ? { participant: req.user._id, status: { $ne: 'Cancelled' } } : { _id: null }
    ],
  });
  
  if (existing) {
    res.status(409);
    throw new Error('You are already registered for this event');
  }
  
  const isFull = event.currentRegistrations >= event.maxCapacity;
  
  // If full and waitlist disabled
  if (isFull && !event.allowWaitlist) {
    res.status(400);
    throw new Error('Event is full and waitlist is not available');
  }
  
  // If full, add to waitlist
  if (isFull) {
    const waitlistCount = await Waitlist.countDocuments({ event: eventId });
    const waitlistEntry = await Waitlist.create({
      event: eventId,
      fullName,
      email,
      phone,
      organization,
      customFieldValues: customFieldValues || [],
      position: waitlistCount + 1,
    });
    
    try {
      await sendEmail({
        to: email,
        subject: `You've been added to the waitlist — ${event.title}`,
        html: `
          <h2>Waitlist Confirmation</h2>
          <p>Hi ${fullName},</p>
          <p>You have been added to the waitlist for <strong>${event.title}</strong>.</p>
          <p>Your position: <strong>${waitlistEntry.position}</strong></p>
          <p>We'll notify you if a spot opens up.</p>
        `,
      });
    } catch (err) {
      console.error('Waitlist email error:', err);
    }
    
    await logAction(req, 'WAITLIST_JOINED', 'Waitlist', waitlistEntry._id, `${fullName} joined waitlist for ${event.title}`);
    
    return res.status(201).json({
      message: 'Added to waitlist',
      waitlist: waitlistEntry,
      waitlisted: true,
    });
  }
  
  // Create confirmed registration
  const registrationCode = await generateRegistrationCode();
  const ticketNumber = await generateTicketNumber();
  
  const registration = await Registration.create({
    registrationCode,
    ticketNumber,
    event: eventId,
    participant: req.user?._id,
    fullName,
    email,
    phone,
    organization,
    customFieldValues: customFieldValues || [],
    status: 'Confirmed',
  });
  
  // Increment event count
  event.currentRegistrations += 1;
  await event.save();
  
  // Send confirmation email with PDF
  try {
    const organizer = await User.findById(event.organizer);
    const pdfBuffer = await generateTicketPDF(registration, event, organizer);
    
    await sendEmail({
      to: email,
      subject: `Registration Confirmed — ${event.title}`,
      html: `
        <h2>Registration Confirmed!</h2>
        <p>Hi ${fullName},</p>
        <p>You are registered for <strong>${event.title}</strong>.</p>
        <p><strong>Registration Code:</strong> ${registrationCode}</p>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString('en-GB')} at ${event.startTime}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p>Your PDF ticket is attached to this email.</p>
      `,
      attachments: [
        {
          filename: `ticket-${ticketNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (err) {
    console.error('Confirmation email error:', err);
  }
  
  // Check capacity alerts
  await sendCapacityAlert(event);
  
  await logAction(req, 'REGISTRATION_CREATED', 'Registration', registration._id, `${fullName} registered for ${event.title}`);
  
  res.status(201).json({
    registration,
    waitlisted: false,
  });
});

export const getAllRegistrations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, attendance, eventId, startDate, endDate } = req.query;
  const query = {};
  
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { registrationCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (attendance) query.attendanceStatus = attendance;
  if (eventId) query.event = eventId;
  if (startDate || endDate) {
    query.registrationDate = {};
    if (startDate) query.registrationDate.$gte = new Date(startDate);
    if (endDate) query.registrationDate.$lte = new Date(endDate);
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .populate('event', 'title eventCode startDate')
      .populate('participant', 'fullName email')
      .sort('-registrationDate')
      .skip(skip)
      .limit(parseInt(limit)),
    Registration.countDocuments(query),
  ]);
  
  res.json({
    registrations,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { page = 1, limit = 50, search, status, attendance } = req.query;
  
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these registrations');
  }
  
  const query = { event: eventId };
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { registrationCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (attendance) query.attendanceStatus = attendance;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .sort('-registrationDate')
      .skip(skip)
      .limit(parseInt(limit)),
    Registration.countDocuments(query),
  ]);
  
  res.json({
    registrations,
    event,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, status } = req.query;
  const query = {
    $or: [
      { participant: req.user._id },
      { email: req.user.email },
    ],
  };
  if (status) query.status = status;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .populate('event', 'title eventCode startDate endDate startTime location bannerImage status')
      .sort('-registrationDate')
      .skip(skip)
      .limit(parseInt(limit)),
    Registration.countDocuments(query),
  ]);
  
  res.json({
    registrations,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getRegistrationById = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .populate('event')
    .populate('participant', 'fullName email');
  
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  
  // Auth check
  if (req.user.role !== 'admin' && 
      registration.participant?._id?.toString() !== req.user._id.toString() &&
      registration.email !== req.user.email) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  res.json(registration);
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate('event');
  
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  
  // Auth check
  const isOwner = registration.participant?.toString() === req.user._id?.toString() || 
                  registration.email === req.user.email;
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  // Cannot cancel after event has started
  if (new Date() >= new Date(registration.event.startDate)) {
    res.status(400);
    throw new Error('Cannot cancel registration after event has started');
  }
  
  registration.status = 'Cancelled';
  registration.cancelledAt = new Date();
  registration.cancellationReason = req.body.reason || 'Cancelled by user';
  await registration.save();
  
  // Decrement event count
  if (registration.event.currentRegistrations > 0) {
    registration.event.currentRegistrations -= 1;
    await registration.event.save();
  }
  
  // Promote from waitlist
  try {
    const nextWaitlist = await Waitlist.findOne({ event: registration.event._id })
      .sort('position');
    
    if (nextWaitlist) {
      const registrationCode = await generateRegistrationCode();
      const ticketNumber = await generateTicketNumber();
      
      const newRegistration = await Registration.create({
        registrationCode,
        ticketNumber,
        event: registration.event._id,
        fullName: nextWaitlist.fullName,
        email: nextWaitlist.email,
        phone: nextWaitlist.phone,
        organization: nextWaitlist.organization,
        customFieldValues: nextWaitlist.customFieldValues,
        status: 'Confirmed',
      });
      
      registration.event.currentRegistrations += 1;
      await registration.event.save();
      
      await Waitlist.findByIdAndDelete(nextWaitlist._id);
      
      // Send promotion email
      try {
        const event = registration.event;
        const organizer = await User.findById(event.organizer);
        const pdfBuffer = await generateTicketPDF(newRegistration, event, organizer);
        
        await sendEmail({
          to: nextWaitlist.email,
          subject: `A spot just opened for you! — ${event.title}`,
          html: `
            <h2>Great news!</h2>
            <p>Hi ${nextWaitlist.fullName},</p>
            <p>A spot has opened up for <strong>${event.title}</strong> and you have been moved from the waitlist to a confirmed registration.</p>
            <p><strong>Registration Code:</strong> ${registrationCode}</p>
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
            <p>Your ticket is attached.</p>
          `,
          attachments: [
            {
              filename: `ticket-${ticketNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });
      } catch (err) {
        console.error('Promotion email error:', err);
      }
    }
  } catch (err) {
    console.error('Waitlist promotion error:', err);
  }
  
  await logAction(req, 'REGISTRATION_CANCELLED', 'Registration', registration._id, `Registration ${registration.registrationCode} cancelled`);
  
  res.json(registration);
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { attendanceStatus } = req.body;
  const registration = await Registration.findById(req.params.id).populate('event');
  
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  
  if (req.user.role !== 'admin' && registration.event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  // Business rule: attendance only on/after event start
  if (new Date() < new Date(registration.event.startDate)) {
    res.status(400);
    throw new Error('Cannot mark attendance before event starts');
  }
  
  registration.attendanceStatus = attendanceStatus;
  registration.checkedInBy = req.user._id;
  registration.checkedInAt = new Date();
  await registration.save();
  
  await logAction(req, 'ATTENDANCE_MARKED', 'Registration', registration._id, `Marked ${attendanceStatus}`);
  
  res.json(registration);
});

export const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { updates } = req.body; // [{ registrationId, attendanceStatus }]
  
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  if (new Date() < new Date(event.startDate)) {
    res.status(400);
    throw new Error('Cannot mark attendance before event starts');
  }
  
  const results = [];
  for (const update of updates) {
    const reg = await Registration.findById(update.registrationId);
    if (reg && reg.event.toString() === eventId) {
      reg.attendanceStatus = update.attendanceStatus;
      reg.checkedInBy = req.user._id;
      reg.checkedInAt = new Date();
      await reg.save();
      results.push(reg);
    }
  }
  
  await logAction(req, 'BULK_ATTENDANCE_MARKED', 'Event', eventId, `Marked ${updates.length} attendees`);
  
  res.json({ updated: results.length, registrations: results });
});

export const sendBulkEmailToRegistrants = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { subject, message } = req.body;
  
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
  const recipients = registrations.map(r => r.email);
  
  const html = `
    <h2>${event.title}</h2>
    <p>${message}</p>
    <hr>
    <p><strong>Event Details:</strong></p>
    <p>Date: ${new Date(event.startDate).toLocaleDateString('en-GB')} ${event.startTime}</p>
    <p>Location: ${event.location}</p>
  `;
  
  const results = await sendBulkEmail(recipients, subject, html);
  
  await logAction(req, 'BULK_EMAIL_SENT', 'Event', eventId, `Sent email to ${recipients.length} registrants`);
  
  res.json({ sent: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length });
});

export const downloadTicket = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate('event');
  
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  
  const isOwner = registration.participant?.toString() === req.user?._id?.toString() || 
                  registration.email === req.user?.email;
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  const organizer = await User.findById(registration.event.organizer);
  const pdfBuffer = await generateTicketPDF(registration, registration.event, organizer);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ticket-${registration.ticketNumber}.pdf`);
  res.send(pdfBuffer);
});

export const exportRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { format = 'pdf' } = req.query;
  
  const event = await Event.findById(eventId).populate('category', 'name');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  
  const registrations = await Registration.find({ event: eventId }).sort('fullName');
  
  if (format === 'csv') {
    const headers = ['Reg Code', 'Ticket No', 'Name', 'Email', 'Phone', 'Org', 'Reg Date', 'Status', 'Attendance'];
    const rows = registrations.map(r => [
      r.registrationCode,
      r.ticketNumber,
      r.fullName,
      r.email,
      r.phone || '',
      r.organization || '',
      new Date(r.registrationDate).toLocaleDateString('en-GB'),
      r.status,
      r.attendanceStatus,
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=participants-${event.eventCode}.csv`);
    res.send(csv);
  } else {
    const pdfBuffer = await generateParticipantListPDF(event, registrations);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=participants-${event.eventCode}.pdf`);
    res.send(pdfBuffer);
  }
});

export const exportAttendanceReport = asyncHandler(async (req, res) => {
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
  res.setHeader('Content-Disposition', `attachment; filename=attendance-${event.eventCode}.pdf`);
  res.send(pdfBuffer);
});

export const joinWaitlist = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { fullName, email, phone, organization, customFieldValues } = req.body;
  
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  if (!event.allowWaitlist) {
    res.status(400);
    throw new Error('Waitlist not available for this event');
  }
  
  if (event.currentRegistrations < event.maxCapacity) {
    res.status(400);
    throw new Error('Event is not full, please register directly');
  }
  
  const existing = await Waitlist.findOne({ event: eventId, email });
  if (existing) {
    res.status(409);
    throw new Error('You are already on the waitlist');
  }
  
  const waitlistCount = await Waitlist.countDocuments({ event: eventId });
  const waitlistEntry = await Waitlist.create({
    event: eventId,
    fullName,
    email,
    phone,
    organization,
    customFieldValues: customFieldValues || [],
    position: waitlistCount + 1,
  });
  
  res.status(201).json(waitlistEntry);
});

export const getEventWaitlist = asyncHandler(async (req, res) => {
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
  
  const waitlist = await Waitlist.find({ event: eventId }).sort('position');
  res.json(waitlist);
});
