import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import Badge from '../../components/common/Badge.jsx';
import { publicAPI, registrationsAPI } from '../../api/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatDate.js';
import { calculateEventStatus } from '../../utils/eventStatus.js';

const PublicEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await publicAPI.getEventById(id);
        setEvent(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card h-96 animate-pulse bg-neutral-100" />
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Event not found
          </h2>
          <p className="text-neutral-500 mb-4">
            This event may have been removed or unpublished.
          </p>
          <Link to="/events" className="btn-primary">
            Browse events
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const status = calculateEventStatus(event);
  const isFull = event.currentRegistrations >= event.maxCapacity;
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isCancelled = event.status === 'Cancelled';
  const isPast = new Date() > new Date(event.endDate);
  const slotsLeft = Math.max(0, event.maxCapacity - event.currentRegistrations);
  const fillPercentage =
    event.maxCapacity > 0
      ? Math.round((event.currentRegistrations / event.maxCapacity) * 100)
      : 0;

  const userRegistration = event.userRegistration;
  const isRegistered =
    userRegistration &&
    (userRegistration.status === 'Confirmed' ||
      userRegistration.status === 'Waitlisted');

  const canRegister =
    !isCancelled &&
    !isPast &&
    !isDeadlinePassed &&
    !isRegistered &&
    (!isFull || event.allowWaitlist);

  const handleRegister = async () => {
    if (user) {
      if (user.role === 'participant' || user.role === 'admin') {
        navigate(`/participant/events/${id}/register`);
      } else {
        navigate(`/${user.role}/dashboard`);
      }
    } else {
      navigate(`/login?redirect=/participant/events/${id}/register`);
    }
  };

  const handleViewTicket = () => {
    if (userRegistration?._id) {
      navigate(`/participant/registrations/${userRegistration._id}/ticket`);
    } else {
      navigate('/participant/registrations');
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration?._id) return;
    const reason = window.prompt('Why are you cancelling? (optional)');
    setCancelLoading(true);
    try {
      await registrationsAPI.cancel(userRegistration._id, reason || '');
      toast.success('Registration cancelled');
      const response = await publicAPI.getEventById(id);
      setEvent(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancelLoading(false);
    }
  };

  const renderActionButton = () => {
    if (isRegistered) {
      if (userRegistration.status === 'Waitlisted') {
        return (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 text-center text-sm">
              <div className="font-semibold mb-1">You're on the waitlist</div>
              {userRegistration.waitlistPosition && (
                <div>Position: #{userRegistration.waitlistPosition}</div>
              )}
            </div>
            {user && (user.role === 'participant' || user.role === 'admin') && (
              <button
                onClick={handleCancelRegistration}
                disabled={cancelLoading}
                className="w-full btn-secondary text-sm disabled:opacity-50"
              >
                {cancelLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cancelling...
                  </span>
                ) : (
                  'Leave Waitlist'
                )}
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-3 text-center text-sm">
            <CheckCircleIcon className="h-5 w-5 mx-auto mb-1" />
            <div className="font-semibold">You're Registered!</div>
            {userRegistration.registrationCode && (
              <div className="font-mono text-xs mt-1">
                {userRegistration.registrationCode}
              </div>
            )}
          </div>
          {user && (user.role === 'participant' || user.role === 'admin') && (
            <>
              <button
                onClick={handleViewTicket}
                className="w-full btn-primary"
              >
                <TicketIcon className="h-4 w-4" />
                View Ticket
              </button>
              <button
                onClick={handleCancelRegistration}
                disabled={cancelLoading}
                className="w-full btn-secondary text-sm disabled:opacity-50"
              >
                {cancelLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Registration'
                )}
              </button>
            </>
          )}
        </div>
      );
    }

    if (isCancelled) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-center text-sm">
          Event Cancelled
        </div>
      );
    }
    if (isPast) {
      return (
        <div className="bg-neutral-100 text-neutral-600 rounded p-3 text-center text-sm">
          Event has ended
        </div>
      );
    }
    if (isDeadlinePassed) {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 text-center text-sm">
          Registration Closed
        </div>
      );
    }
    if (isFull && !event.allowWaitlist) {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 text-center text-sm">
          Event Full
        </div>
      );
    }

    if (!canRegister) return null;

    return (
      <>
        <button
          onClick={handleRegister}
          className="w-full btn-primary"
        >
          {isFull && event.allowWaitlist
            ? 'Join Waitlist'
            : user
            ? 'Register Now'
            : 'Login to Register'}
        </button>
        {!user && (
          <p className="text-xs text-neutral-500 text-center mt-3">
            You'll need an account to complete registration
          </p>
        )}
      </>
    );
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/events"
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to events
        </Link>

        <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-primary-pale to-primary mb-6">
          {event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarIcon className="h-24 w-24 text-white/50" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {event.category && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-pale"
                  style={{ color: event.category.color }}
                >
                  {event.category.icon} {event.category.name}
                </span>
              )}
              <Badge status={status}>{status}</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
              {event.title}
            </h1>

            {event.organizer && (
              <p className="text-neutral-600 mb-4">
                Organized by{' '}
                <Link
                  to={`/organizers/${event.organizer._id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {event.organizer.organization || event.organizer.fullName}
                </Link>
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="card p-3">
                <CalendarIcon className="h-5 w-5 text-primary mb-1" />
                <div className="text-xs text-neutral-500">Date</div>
                <div className="font-medium">{formatDate(event.startDate)}</div>
              </div>
              <div className="card p-3">
                <ClockIcon className="h-5 w-5 text-primary mb-1" />
                <div className="text-xs text-neutral-500">Time</div>
                <div className="font-medium">
                  {event.startTime} - {event.endTime}
                </div>
              </div>
              <div className="card p-3">
                <MapPinIcon className="h-5 w-5 text-primary mb-1" />
                <div className="text-xs text-neutral-500">Location</div>
                <div className="font-medium truncate">{event.location}</div>
              </div>
            </div>

            {event.virtualLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="text-sm font-medium text-blue-900">
                  Virtual Event Link
                </div>
                <a
                  href={event.virtualLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {event.virtualLink}
                </a>
              </div>
            )}

            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-3">About this Event</h2>
              <p className="text-neutral-700 whitespace-pre-line">
                {event.description}
              </p>

              {event.tags?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-primary-pale text-primary text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {event.organizer?.bio && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-3">About the Organizer</h2>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                    {event.organizer.profileImage ? (
                      <img
                        src={event.organizer.profileImage}
                        alt={event.organizer.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      event.organizer.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/organizers/${event.organizer._id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {event.organizer.organization || event.organizer.fullName}
                    </Link>
                    <p className="text-sm text-neutral-600 mt-1">
                      {event.organizer.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 lg:sticky lg:top-20">
              <div className="text-center mb-4 pb-4 border-b">
                <div className="text-sm text-neutral-500">Price</div>
                <div className="text-3xl font-bold text-accent">
                  {event.isFree ? 'Free' : `NGN ${event.ticketPrice?.toLocaleString()}`}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Capacity</span>
                  <span className="font-medium">
                    {event.currentRegistrations} / {event.maxCapacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      fillPercentage < 60
                        ? 'bg-green-500'
                        : fillPercentage < 90
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Slots Left</span>
                  <span className="font-medium">{slotsLeft}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Deadline</span>
                  <span className="font-medium">
                    {formatDate(event.registrationDeadline)}
                  </span>
                </div>
              </div>

              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicEventDetail;
