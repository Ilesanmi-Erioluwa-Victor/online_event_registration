import express from 'express';
import {
  createEvent,
  getEvents,
  getMyEvents,
  getAdminEvents,
  getEventById,
  updateEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
  uploadBanner,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/admin/all', protect, authorize('admin'), getAdminEvents);
router.get('/:id', optionalAuth, getEventById);

router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, updateEvent);
router.post('/:id/publish', protect, publishEvent);
router.post('/:id/cancel', protect, cancelEvent);
router.post('/:id/complete', protect, completeEvent);
router.post('/:id/banner', protect, authorize('organizer', 'admin'), upload.single('banner'), uploadBanner);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

export default router;
