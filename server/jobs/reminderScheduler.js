import cron from 'node-cron';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Settings from '../models/Settings.js';
import { sendEmail } from '../config/email.js';

// Run every hour
export const startReminderScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running reminder scheduler...');
      const settings = await Settings.getSettings();
      const hoursBefore = settings.reminderHoursBefore || 24;
      
      const now = new Date();
      const reminderTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
      
      // Find published events that start within the reminder window
      const events = await Event.find({
        status: 'Published',
        reminderSent: false,
        startDate: { $gte: now, $lte: reminderTime },
      }).populate('organizer', 'fullName email');
      
      for (const event of events) {
        const registrations = await Registration.find({ 
          event: event._id, 
          status: 'Confirmed' 
        });
        
        for (const reg of registrations) {
          try {
            await sendEmail({
              to: reg.email,
              subject: `Reminder: ${event.title} starts in ${hoursBefore} hours!`,
              html: `
                <h2>Event Reminder</h2>
                <p>Hi ${reg.fullName},</p>
                <p>This is a friendly reminder that <strong>${event.title}</strong> is starting soon!</p>
                <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString('en-GB')} at ${event.startTime}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                ${event.virtualLink ? `<p><strong>Virtual Link:</strong> <a href="${event.virtualLink}">${event.virtualLink}</a></p>` : ''}
                <p><strong>Your Ticket:</strong> ${reg.ticketNumber}</p>
                <p><strong>Registration Code:</strong> ${reg.registrationCode}</p>
                <p>See you there!</p>
              `,
            });
          } catch (err) {
            console.error('Reminder email error for', reg.email, err);
          }
        }
        
        event.reminderSent = true;
        await event.save();
        console.log(`Reminder sent for event: ${event.title}`);
      }
    } catch (err) {
      console.error('Reminder scheduler error:', err);
    }
  });
  
  // Run daily at midnight - auto-complete past events
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running auto-complete scheduler...');
      const now = new Date();
      const result = await Event.updateMany(
        {
          status: 'Published',
          endDate: { $lt: now },
        },
        {
          $set: { status: 'Completed' },
        }
      );
      console.log(`Auto-completed ${result.modifiedCount} events`);
    } catch (err) {
      console.error('Auto-complete scheduler error:', err);
    }
  });
  
  console.log('Schedulers started');
};
