import express from 'express';
import {
  createRegistration,
  getAllRegistrations,
  getEventRegistrations,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  markAttendance,
  bulkMarkAttendance,
  sendBulkEmailToRegistrants,
  downloadTicket,
  exportRegistrations,
  exportAttendanceReport,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, createRegistration);
router.get('/', protect, authorize('admin'), getAllRegistrations);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, getEventRegistrations);
router.get('/event/:eventId/export', protect, exportRegistrations);
router.get('/event/:eventId/attendance-report', protect, exportAttendanceReport);
router.post('/event/:eventId/bulk-attendance', protect, bulkMarkAttendance);
router.post('/event/:eventId/send-bulk-email', protect, sendBulkEmailToRegistrants);
router.get('/:id', protect, getRegistrationById);
router.get('/:id/ticket', protect, downloadTicket);
router.post('/:id/cancel', protect, cancelRegistration);
router.post('/:id/attendance', protect, authorize('organizer', 'admin'), markAttendance);

export default router;
