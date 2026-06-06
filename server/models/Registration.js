import mongoose from 'mongoose';

const customFieldValueSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const registrationSchema = new mongoose.Schema({
  registrationCode: {
    type: String,
    unique: true,
  },
  ticketNumber: {
    type: String,
    unique: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required'],
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  organization: {
    type: String,
    trim: true,
  },
  customFieldValues: [customFieldValueSchema],
  status: {
    type: String,
    enum: ['Confirmed', 'Waitlisted', 'Cancelled'],
    default: 'Confirmed',
  },
  attendanceStatus: {
    type: String,
    enum: ['Pending', 'Present', 'Absent'],
    default: 'Pending',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  cancelledAt: Date,
  cancellationReason: String,
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  checkedInAt: Date,
}, {
  timestamps: true,
});

registrationSchema.index({ event: 1, email: 1 });
registrationSchema.index({ participant: 1 });
registrationSchema.index({ status: 1 });

export default mongoose.model('Registration', registrationSchema);