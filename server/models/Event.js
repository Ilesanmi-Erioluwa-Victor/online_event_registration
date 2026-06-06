import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    trim: true,
  },
  fieldType: {
    type: String,
    enum: ['text', 'email', 'number', 'select', 'textarea'],
    default: 'text',
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  options: [String], // For select type
});

const eventSchema = new mongoose.Schema({
  eventCode: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required'],
  },
  eventType: {
    type: String,
    enum: ['Physical', 'Virtual', 'Hybrid'],
    required: [true, 'Event type is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  virtualLink: {
    type: String,
    trim: true,
  },
  bannerImage: {
    type: String,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: 1,
  },
  currentRegistrations: {
    type: Number,
    default: 0,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  ticketPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  allowWaitlist: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
    default: 'Draft',
  },
  cancellationReason: {
    type: String,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  customFields: [customFieldSchema],
  reminderSent: {
    type: Boolean,
    default: false,
  },
  alert80Sent: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text' });

eventSchema.virtual('fillPercentage').get(function() {
  if (this.maxCapacity === 0) return 0;
  return Math.round((this.currentRegistrations / this.maxCapacity) * 100);
});

eventSchema.virtual('isRegistrationOpen').get(function() {
  if (this.status !== 'Published') return false;
  if (new Date() > this.registrationDeadline) return false;
  if (this.currentRegistrations >= this.maxCapacity && !this.allowWaitlist) return false;
  return true;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export default mongoose.model('Event', eventSchema);