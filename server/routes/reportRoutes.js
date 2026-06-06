import express from 'express';
import {
  getSystemSummary,
  getEventSummary,
  getRegistrationsByMonth,
  getEventsByCategory,
  getTopEvents,
  getOrganizerStats,
  exportSystemOverview,
  exportEventReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/summary', protect, authorize('admin'), getSystemSummary);
router.get('/event/:eventId/summary', protect, getEventSummary);
router.get('/registrations-by-month', protect, authorize('admin'), getRegistrationsByMonth);
router.get('/events-by-category', protect, authorize('admin'), getEventsByCategory);
router.get('/top-events', protect, authorize('admin'), getTopEvents);
router.get('/organizer-stats', protect, authorize('organizer', 'admin'), getOrganizerStats);
router.get('/export/overview', protect, authorize('admin'), exportSystemOverview);
router.get('/export/event/:eventId', protect, exportEventReport);

export default router;
