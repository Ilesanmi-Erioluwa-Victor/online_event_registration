import express from 'express';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const settings = await Settings.getSettings();
  res.json(settings);
});

router.put('/', protect, authorize('admin'), async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.json(settings);
});

export default router;
