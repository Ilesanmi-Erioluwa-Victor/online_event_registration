import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'EventHub',
  },
  platformTagline: {
    type: String,
    default: 'Register. Attend. Connect.',
  },
  supportEmail: {
    type: String,
    default: 'support@eventhub.com',
  },
  reminderHoursBefore: {
    type: Number,
    default: 24,
  },
  allowPublicRegistration: {
    type: Boolean,
    default: true,
  },
  allowGuestRegistration: {
    type: Boolean,
    default: true,
  },
  requireEmailVerification: {
    type: Boolean,
    default: false,
  },
  maxEventsPerOrganizer: {
    type: Number,
    default: 50,
  },
}, {
  timestamps: true,
});

settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);