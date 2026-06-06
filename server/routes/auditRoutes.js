import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;
  
  const query = {};
  if (action) query.action = action;
  if (userId) query.performedBy = userId;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('performedBy', 'fullName email role')
      .sort('-timestamp')
      .skip(skip)
      .limit(parseInt(limit)),
    AuditLog.countDocuments(query),
  ]);
  
  res.json({
    logs,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export default router;
