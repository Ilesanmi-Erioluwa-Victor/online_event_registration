import Badge from '../common/Badge.jsx';

const ParticipantRow = ({ registration, onMarkPresent, onMarkAbsent, onCancel, onView }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-pale text-primary rounded-full flex items-center justify-center font-semibold text-sm">
            {getInitials(registration.fullName)}
          </div>
          <div>
            <div className="font-medium text-neutral-900">{registration.fullName}</div>
            <div className="text-sm text-neutral-500">{registration.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-neutral-600">
        {registration.registrationCode}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        {registration.ticketNumber}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        {registration.phone || '-'}
      </td>
      <td className="px-4 py-3">
        <Badge status={registration.status}>{registration.status}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge status={registration.attendanceStatus}>{registration.attendanceStatus}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          {registration.status === 'Confirmed' && (
            <>
              <button
                onClick={() => onMarkPresent(registration)}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                title="Mark Present"
              >
                Present
              </button>
              <button
                onClick={() => onMarkAbsent(registration)}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                title="Mark Absent"
              >
                Absent
              </button>
            </>
          )}
          {registration.status === 'Confirmed' && onCancel && (
            <button
              onClick={() => onCancel(registration)}
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ParticipantRow;
