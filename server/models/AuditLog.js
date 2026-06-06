import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
  },
  targetModel: {
    type: String,
    required: [true, 'Target model is required'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);