import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Settings from './models/Settings.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear all data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    
    console.log('Cleared existing data');
    
    // Create users
    const users = await User.create([
      {
        fullName: 'Admin User',
        email: 'admin@events.com',
        password: 'Admin@1234',
        role: 'admin',
        phone: '+234 800 000 0001',
        isActive: true,
      },
      {
        fullName: 'John Organizer',
        email: 'organizer@events.com',
        password: 'Org@1234',
        role: 'organizer',
        phone: '+234 800 000 0002',
        organization: 'Tech Events NG',
        bio: 'Leading tech event organizer in Nigeria',
        isActive: true,
      },
      {
        fullName: 'Jane Smith',
        email: 'organizer2@events.com',
        password: 'Org2@1234',
        role: 'organizer',
        phone: '+234 800 000 0003',
        organization: 'Delta Edu Hub',
        bio: 'Education and training events',
        isActive: true,
      },
      {
        fullName: 'Mike Participant',
        email: 'participant@events.com',
        password: 'Part@1234',
        role: 'participant',
        phone: '+234 800 000 0004',
        isActive: true,
      },
      {
        fullName: 'Sarah Wilson',
        email: 'participant2@events.com',
        password: 'Part2@1234',
        role: 'participant',
        phone: '+234 800 000 0005',
        organization: 'Tech Corp',
        isActive: true,
      },
    ]);
    
    console.log('Created users');
    
    // Create categories
    const categories = await Category.create([
      { name: 'Technology', description: 'Tech events, hackathons, conferences', icon: '💻', color: '#3B82F6', createdBy: users[0]._id },
      { name: 'Education', description: 'Workshops, seminars, training', icon: '🎓', color: '#10B981', createdBy: users[0]._id },
      { name: 'Business', description: 'Networking, summits, expos', icon: '💼', color: '#F59E0B', createdBy: users[0]._id },
      { name: 'Health & Wellness', description: 'Health seminars, fitness events', icon: '🏥', color: '#EF4444', createdBy: users[0]._id },
      { name: 'Arts & Culture', description: 'Music, art, cultural events', icon: '🎨', color: '#8B5CF6', createdBy: users[0]._id },
      { name: 'Sports', description: 'Tournaments, fitness events', icon: '⚽', color: '#06B6D4', createdBy: users[0]._id },
    ]);
    
    console.log('Created categories');
    
    // Create events
    const now = new Date();
    const inDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const events = await Event.create([
      {
        eventCode: 'EVT-2026-00001',
        title: 'Tech Innovation Summit 2026',
        description: 'Join us for the biggest tech event of the year featuring talks from industry leaders, hands-on workshops, and networking opportunities. Learn about AI, blockchain, cloud computing, and more.',
        category: categories[0]._id,
        organizer: users[1]._id,
        eventType: 'Hybrid',
        location: 'Lagos Continental Hotel, Victoria Island',
        virtualLink: 'https://zoom.us/j/123456789',
        startDate: inDays(7),
        endDate: inDays(9),
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        registrationDeadline: inDays(5),
        maxCapacity: 100,
        currentRegistrations: 85,
        isFree: false,
        ticketPrice: 15000,
        allowWaitlist: true,
        status: 'Published',
        tags: ['AI', 'Blockchain', 'Cloud', 'Innovation'],
        customFields: [
          { fieldName: 'T-Shirt Size', fieldType: 'select', isRequired: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
          { fieldName: 'Dietary Requirements', fieldType: 'text', isRequired: false },
        ],
        createdBy: users[1]._id,
      },
      {
        eventCode: 'EVT-2026-00002',
        title: 'Web Development Bootcamp',
        description: 'A comprehensive 3-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Perfect for beginners and intermediate developers.',
        category: categories[1]._id,
        organizer: users[1]._id,
        eventType: 'Physical',
        location: 'Tech Hub, Yaba, Lagos',
        startDate: inDays(14),
        endDate: inDays(16),
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        registrationDeadline: inDays(10),
        maxCapacity: 50,
        currentRegistrations: 50,
        isFree: false,
        ticketPrice: 25000,
        allowWaitlist: true,
        status: 'Published',
        tags: ['Web Dev', 'React', 'Node.js', 'JavaScript'],
        createdBy: users[1]._id,
      },
      {
        eventCode: 'EVT-2026-00003',
        title: 'Business Networking Mixer',
        description: 'Connect with entrepreneurs, investors, and business leaders in a relaxed setting. Great opportunity to expand your network.',
        category: categories[2]._id,
        organizer: users[2]._id,
        eventType: 'Physical',
        location: 'Eko Hotel, Lagos',
        startDate: now,
        endDate: now,
        startTime: '06:00 PM',
        endTime: '09:00 PM',
        registrationDeadline: inDays(-1),
        maxCapacity: 200,
        currentRegistrations: 150,
        isFree: true,
        ticketPrice: 0,
        allowWaitlist: false,
        status: 'Published',
        tags: ['Networking', 'Business'],
        createdBy: users[2]._id,
      },
      {
        eventCode: 'EVT-2026-00004',
        title: 'Mental Health Awareness Workshop',
        description: 'A workshop focused on mental health awareness, stress management, and well-being in the workplace.',
        category: categories[3]._id,
        organizer: users[2]._id,
        eventType: 'Virtual',
        location: 'Online',
        virtualLink: 'https://meet.google.com/abc-defg-hij',
        startDate: inDays(-30),
        endDate: inDays(-30),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        registrationDeadline: inDays(-31),
        maxCapacity: 300,
        currentRegistrations: 245,
        isFree: true,
        ticketPrice: 0,
        allowWaitlist: false,
        status: 'Completed',
        tags: ['Mental Health', 'Wellness', 'Workshop'],
        createdBy: users[2]._id,
      },
      {
        eventCode: 'EVT-2026-00005',
        title: 'Art Exhibition: Colors of Nigeria',
        description: 'A showcase of contemporary Nigerian art featuring works from emerging and established artists.',
        category: categories[4]._id,
        organizer: users[1]._id,
        eventType: 'Physical',
        location: 'National Museum, Lagos',
        startDate: inDays(21),
        endDate: inDays(25),
        startTime: '10:00 AM',
        endTime: '06:00 PM',
        registrationDeadline: inDays(15),
        maxCapacity: 500,
        currentRegistrations: 120,
        isFree: true,
        ticketPrice: 0,
        allowWaitlist: false,
        status: 'Cancelled',
        cancellationReason: 'Venue unavailable due to renovations',
        tags: ['Art', 'Exhibition', 'Culture'],
        createdBy: users[1]._id,
      },
      {
        eventCode: 'EVT-2026-00006',
        title: 'Marathon Training Camp',
        description: 'A 5-day training camp for the upcoming Lagos City Marathon. Includes coaching, nutrition advice, and practice runs.',
        category: categories[5]._id,
        organizer: users[2]._id,
        eventType: 'Physical',
        location: 'National Stadium, Surulere',
        startDate: inDays(30),
        endDate: inDays(35),
        startTime: '06:00 AM',
        endTime: '09:00 AM',
        registrationDeadline: inDays(25),
        maxCapacity: 50,
        currentRegistrations: 0,
        isFree: true,
        ticketPrice: 0,
        allowWaitlist: true,
        status: 'Draft',
        tags: ['Marathon', 'Fitness', 'Running'],
        createdBy: users[2]._id,
      },
    ]);
    
    console.log('Created events');
    
    // Create registrations
    const regCodes = ['REG-202600001', 'REG-202600002', 'REG-202600003', 'REG-202600004', 
                      'REG-202600005', 'REG-202600006', 'REG-202600007', 'REG-202600008'];
    const ticketNums = ['TKT000001', 'TKT000002', 'TKT000003', 'TKT000004',
                        'TKT000005', 'TKT000006', 'TKT000007', 'TKT000008'];
    
    await Registration.create([
      {
        registrationCode: regCodes[0],
        ticketNumber: ticketNums[0],
        event: events[0]._id,
        participant: users[3]._id,
        fullName: 'Mike Participant',
        email: 'participant@events.com',
        phone: '+234 800 000 0004',
        status: 'Confirmed',
        attendanceStatus: 'Pending',
        customFieldValues: [
          { fieldName: 'T-Shirt Size', value: 'L' },
          { fieldName: 'Dietary Requirements', value: 'None' },
        ],
      },
      {
        registrationCode: regCodes[1],
        ticketNumber: ticketNums[1],
        event: events[0]._id,
        participant: users[4]._id,
        fullName: 'Sarah Wilson',
        email: 'participant2@events.com',
        phone: '+234 800 000 0005',
        organization: 'Tech Corp',
        status: 'Confirmed',
        attendanceStatus: 'Pending',
        customFieldValues: [
          { fieldName: 'T-Shirt Size', value: 'M' },
        ],
      },
      {
        registrationCode: regCodes[2],
        ticketNumber: ticketNums[2],
        event: events[1]._id,
        participant: users[3]._id,
        fullName: 'Mike Participant',
        email: 'participant@events.com',
        phone: '+234 800 000 0004',
        status: 'Confirmed',
        attendanceStatus: 'Pending',
      },
      {
        registrationCode: regCodes[3],
        ticketNumber: ticketNums[3],
        event: events[3]._id,
        participant: users[3]._id,
        fullName: 'Mike Participant',
        email: 'participant@events.com',
        phone: '+234 800 000 0004',
        status: 'Confirmed',
        attendanceStatus: 'Present',
        checkedInAt: inDays(-30),
      },
      {
        registrationCode: regCodes[4],
        ticketNumber: ticketNums[4],
        event: events[3]._id,
        participant: users[4]._id,
        fullName: 'Sarah Wilson',
        email: 'participant2@events.com',
        phone: '+234 800 000 0005',
        status: 'Confirmed',
        attendanceStatus: 'Absent',
      },
      {
        registrationCode: regCodes[5],
        ticketNumber: ticketNums[5],
        event: events[2]._id,
        participant: users[3]._id,
        fullName: 'Mike Participant',
        email: 'participant@events.com',
        phone: '+234 800 000 0004',
        status: 'Confirmed',
        attendanceStatus: 'Pending',
      },
      {
        registrationCode: regCodes[6],
        ticketNumber: ticketNums[6],
        event: events[0]._id,
        fullName: 'Guest User',
        email: 'guest@example.com',
        phone: '+234 800 999 9999',
        status: 'Waitlisted',
      },
      {
        registrationCode: regCodes[7],
        ticketNumber: ticketNums[7],
        event: events[1]._id,
        participant: users[4]._id,
        fullName: 'Sarah Wilson',
        email: 'participant2@events.com',
        phone: '+234 800 000 0005',
        status: 'Cancelled',
        cancelledAt: inDays(-2),
        cancellationReason: 'Schedule conflict',
      },
    ]);
    
    console.log('Created registrations');
    
    // Create settings
    await Settings.create({
      platformName: 'EventHub',
      platformTagline: 'Register. Attend. Connect.',
      supportEmail: 'support@eventhub.com',
      reminderHoursBefore: 24,
      allowPublicRegistration: true,
      allowGuestRegistration: true,
      requireEmailVerification: false,
      maxEventsPerOrganizer: 50,
    });
    
    console.log('Created settings');
    
    console.log('\n=== Seed completed successfully ===');
    console.log('\nLogin credentials:');
    console.log('Admin       : admin@events.com       / Admin@1234');
    console.log('Organizer   : organizer@events.com   / Org@1234');
    console.log('Organizer 2 : organizer2@events.com  / Org2@1234');
    console.log('Participant : participant@events.com / Part@1234');
    console.log('Participant2: participant2@events.com / Part2@1234\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
