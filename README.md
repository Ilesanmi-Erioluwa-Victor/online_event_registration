# EventHub - Online Event Registration & Management System

A full-stack web application for automated online event registration and management. Built for academic project at Delta State Polytechnic, Otefe-Oghara.

## Features

- **Three User Roles**: Admin, Organizer, and Participant
- **Event Management**: Create, publish, and manage events
- **Registration System**: Easy online registration with capacity management
- **Waitlist**: Automatic waitlist when events are full
- **Email Notifications**: Confirmations, reminders, and cancellation notices
- **PDF Tickets**: Auto-generated PDF tickets with QR codes
- **Attendance Tracking**: Mark and track attendance on event day
- **Reports & Analytics**: Charts and exportable PDF reports
- **Audit Logging**: Track all significant actions
- **Role-Based Access**: Secure access control for different user types

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js + MongoDB (Mongoose)
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer
- **PDF**: pdfkit
- **Scheduling**: node-cron
- **File Uploads**: Multer

## Quick Start

### Prerequisites

- Node.js v18+
- MongoDB v6+ (local or MongoDB Atlas)
- npm v9+

### Installation

1. **Clone and install backend**:
```bash
cd server
npm install
cp .env.example .env  # Edit with your values
npm run seed          # Seed initial data
npm run dev           # Starts on port 5000
```

2. **Install frontend** (in a new terminal):
```bash
cd client
npm install
npm run dev           # Starts on port 5173
```

3. **Open browser**: http://localhost:5173

### Test Credentials

After seeding:
- **Admin**: admin@events.com / Admin@1234
- **Organizer**: organizer@events.com / Org@1234
- **Participant**: participant@events.com / Part@1234

## Environment Variables

Configure these in `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/event_registration_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=8h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=EventHub <noreply@eventhub.com>
CLIENT_URL=http://localhost:5173
PLATFORM_NAME=EventHub
PLATFORM_TAGLINE=Register. Attend. Connect.
```

## Project Structure

```
event-registration-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios instance and API calls
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route guards
│   │   └── utils/         # Helper functions
│   └── ...
├── server/                # Node.js backend
│   ├── config/           # DB and email config
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, error, upload
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── jobs/             # Cron jobs
│   ├── utils/            # Helpers
│   └── server.js
└── README.md
```

## API Endpoints

- **Auth**: `/api/auth/*` - register, login, password reset
- **Events**: `/api/events/*` - CRUD operations
- **Registrations**: `/api/registrations/*` - register, manage
- **Categories**: `/api/categories/*` - manage categories
- **Users**: `/api/users/*` - admin user management
- **Reports**: `/api/reports/*` - analytics and exports
- **Audit**: `/api/audit/*` - audit logs
- **Settings**: `/api/settings/*` - platform settings

## License

Academic Project - Delta State Polytechnic, Otefe-Oghara
Approved by: Dr. Elugwa Felix
