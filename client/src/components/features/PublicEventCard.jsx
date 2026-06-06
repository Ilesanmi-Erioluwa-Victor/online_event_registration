import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Badge from '../common/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { calculateEventStatus } from '../../utils/eventStatus.js';

const PublicEventCard = ({ event }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const status = calculateEventStatus(event);
  const fillPercentage =
    event.maxCapacity > 0
      ? Math.round((event.currentRegistrations / event.maxCapacity) * 100)
      : 0;

  const isFull = event.currentRegistrations >= event.maxCapacity;
  const isCancelled = event.status === 'Cancelled';
  const isPast = new Date() > new Date(event.endDate);
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);

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

  const handleRegister = () => {
    if (user) {
      if (user.role === 'participant' || user.role === 'admin') {
        navigate(`/participant/events/${event._id}/register`);
      } else {
        navigate(`/${user.role}/dashboard`);
      }
    } else {
      navigate(`/login?redirect=/participant/events/${event._id}/register`);
    }
  };

  const handleViewTicket = () => {
    if (userRegistration?._id) {
      navigate(`/participant/registrations/${userRegistration._id}/ticket`);
    } else {
      navigate('/participant/registrations');
    }
  };

  const getCapacityColor = () => {
    if (fillPercentage < 60) return 'bg-green-500';
    if (fillPercentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="card hover:shadow-md transition-shadow overflow-hidden border-l-4 border-primary-pale">
      <div className="relative h-40 bg-gradient-to-br from-primary-pale to-primary-light overflow-hidden">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarIcon className="h-16 w-16 text-white/50" />
          </div>
        )}
        {event.category && (
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90"
              style={{ color: event.category.color }}
            >
              <span>{event.category.icon}</span>
              {event.category.name}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <Badge status={status}>{status}</Badge>
          {isRegistered && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                userRegistration.status === 'Waitlisted'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-green-100 text-green-800 border-green-200'
              }`}
            >
              {userRegistration.status === 'Waitlisted' ? (
                <>
                  <ClockIcon className="h-3 w-3" />
                  Waitlisted
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-3 w-3" />
                  Registered
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 line-clamp-2 mb-2 min-h-[3rem]">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-neutral-600 mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">
              {formatDate(event.startDate)} • {event.startTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-4 w-4 text-primary flex-shrink-0" />
            <span>
              {event.currentRegistrations} / {event.maxCapacity} registered
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-500">Capacity</span>
            <span className="font-medium">{fillPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getCapacityColor()} transition-all`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-neutral-500">Price</div>
            <div className="font-bold text-accent">
              {event.isFree ? 'Free' : formatCurrency(event.ticketPrice)}
            </div>
          </div>
          {event.organizer && (
            <div className="text-right">
              <div className="text-xs text-neutral-500">By</div>
              <Link
                to={`/organizers/${event.organizer._id}`}
                className="text-sm font-medium text-primary hover:underline truncate max-w-[140px] block"
              >
                {event.organizer.organization || event.organizer.fullName}
              </Link>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 btn-secondary text-sm py-1.5"
          >
            View Details
          </Link>
          {isRegistered ? (
            <button
              onClick={handleViewTicket}
              className="flex-1 btn-primary text-sm py-1.5"
            >
              {userRegistration.status === 'Waitlisted'
                ? 'View Waitlist'
                : 'View Ticket'}
            </button>
          ) : (
            canRegister && (
              <button
                onClick={handleRegister}
                className="flex-1 btn-primary text-sm py-1.5"
              >
                {isFull && event.allowWaitlist
                  ? 'Join Waitlist'
                  : user
                  ? 'Register'
                  : 'Login to Register'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicEventCard;
