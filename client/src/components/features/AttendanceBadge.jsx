import { getStatusColor } from '../../utils/eventStatus.js';

const AttendanceBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default AttendanceBadge;
