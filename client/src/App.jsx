import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';

// Public pages
import Landing from './pages/public/Landing.jsx';
import PublicEvents from './pages/public/PublicEvents.jsx';
import PublicEventDetail from './pages/public/PublicEventDetail.jsx';
import PublicOrganizers from './pages/public/PublicOrganizers.jsx';
import PublicOrganizerDetail from './pages/public/PublicOrganizerDetail.jsx';

// Auth pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import AllEvents from './pages/admin/AllEvents.jsx';
import AllRegistrations from './pages/admin/AllRegistrations.jsx';
import Reports from './pages/admin/Reports.jsx';
import AuditLogs from './pages/admin/AuditLogs.jsx';
import Settings from './pages/admin/Settings.jsx';

// Organizer pages
import OrganizerDashboard from './pages/organizer/Dashboard.jsx';
import MyEvents from './pages/organizer/MyEvents.jsx';
import CreateEvent from './pages/organizer/CreateEvent.jsx';
import EditEvent from './pages/organizer/EditEvent.jsx';
import OrganizerEventDetail from './pages/organizer/EventDetail.jsx';
import Registrations from './pages/organizer/Registrations.jsx';
import MarkAttendance from './pages/organizer/MarkAttendance.jsx';

// Participant pages
import ParticipantDashboard from './pages/participant/Dashboard.jsx';
import BrowseEvents from './pages/participant/BrowseEvents.jsx';
import ParticipantEventDetail from './pages/participant/EventDetail.jsx';
import RegisterForEvent from './pages/participant/RegisterForEvent.jsx';
import MyRegistrations from './pages/participant/MyRegistrations.jsx';
import MyTicket from './pages/participant/MyTicket.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes (accessible without login) */}
      <Route path="/" element={<Landing />} />
      <Route path="/events" element={<PublicEvents />} />
      <Route path="/events/:id" element={<PublicEventDetail />} />
      <Route path="/organizers" element={<PublicOrganizers />} />
      <Route path="/organizers/:id" element={<PublicOrganizerDetail />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/participant/dashboard" replace />}
      />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to={`/${user.role}/dashboard`} replace />}
      />
      <Route
        path="/reset-password/:token"
        element={!user ? <ResetPassword /> : <Navigate to={`/${user.role}/dashboard`} replace />}
      />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><RoleRoute roles={['admin']}><UserManagement /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute><RoleRoute roles={['admin']}><AllEvents /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/registrations" element={<ProtectedRoute><RoleRoute roles={['admin']}><AllRegistrations /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><RoleRoute roles={['admin']}><Reports /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute><RoleRoute roles={['admin']}><AuditLogs /></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><RoleRoute roles={['admin']}><Settings /></RoleRoute></ProtectedRoute>} />

      {/* Organizer routes */}
      <Route path="/organizer" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><OrganizerDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/dashboard" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><OrganizerDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/events" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><MyEvents /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/events/new" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><CreateEvent /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/events/:id" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><OrganizerEventDetail /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/events/:id/edit" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><EditEvent /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/events/:id/registrations" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><Registrations /></RoleRoute></ProtectedRoute>} />
      <Route path="/organizer/events/:id/attendance" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><MarkAttendance /></RoleRoute></ProtectedRoute>} />

      {/* Participant routes */}
      <Route path="/participant" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><ParticipantDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/participant/dashboard" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><ParticipantDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/participant/events" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><BrowseEvents /></RoleRoute></ProtectedRoute>} />
      <Route path="/participant/events/:id" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><ParticipantEventDetail /></RoleRoute></ProtectedRoute>} />
      <Route path="/participant/events/:id/register" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><RegisterForEvent /></RoleRoute></ProtectedRoute>} />
      <Route path="/participant/registrations" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><MyRegistrations /></RoleRoute></ProtectedRoute>} />
      <Route path="/participant/registrations/:id/ticket" element={<ProtectedRoute><RoleRoute roles={['participant', 'admin']}><MyTicket /></RoleRoute></ProtectedRoute>} />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
