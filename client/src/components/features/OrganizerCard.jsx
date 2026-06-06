import { Link } from 'react-router-dom';
import { CalendarDaysIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const OrganizerCard = ({ organizer }) => {
  return (
    <Link
      to={`/organizers/${organizer._id}`}
      className="card hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
        {organizer.profileImage ? (
          <img
            src={organizer.profileImage}
            alt={organizer.fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          organizer.fullName?.charAt(0).toUpperCase()
        )}
      </div>
      <h3 className="font-semibold text-neutral-900 line-clamp-1 w-full">
        {organizer.organization || organizer.fullName}
      </h3>
      {organizer.organization && (
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
          {organizer.fullName}
        </p>
      )}
      {organizer.bio && (
        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
          {organizer.bio}
        </p>
      )}
      <div className="mt-3 pt-3 border-t border-neutral-200 w-full flex justify-around text-xs">
        <div className="flex items-center gap-1 text-neutral-700">
          <CalendarDaysIcon className="h-4 w-4 text-primary" />
          <span className="font-semibold">
            {organizer.publishedEventCount || 0}
          </span>
          <span className="text-neutral-500">events</span>
        </div>
        <div className="flex items-center gap-1 text-neutral-700">
          <BuildingOffice2Icon className="h-4 w-4 text-primary" />
          <span className="font-semibold">
            {organizer.upcomingEventCount || 0}
          </span>
          <span className="text-neutral-500">upcoming</span>
        </div>
      </div>
    </Link>
  );
};

export default OrganizerCard;
