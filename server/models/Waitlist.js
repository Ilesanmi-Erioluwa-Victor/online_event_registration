import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required'],
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
  customFieldValues: [{
    fieldName: String,
    value: String,
  }],
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  position: {
    type: Number,
    required: true,
  },
  notified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

waitlistSchema.index({ event: 1, position: 1 });
waitlistSchema.index({ event: 1, email: 1 });

export default mongoose.model('Waitlist', waitlistSchema);