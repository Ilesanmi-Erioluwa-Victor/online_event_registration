export const calculateEventStatus = (event) => {
  if (!event) return 'Unknown';
  
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const regDeadline = new Date(event.registrationDeadline);
  
  if (event.status === 'Cancelled' || event.status === 'Draft') {
    return event.status;
  }
  
  if (now > endDate) {
    return 'Completed';
  }
  
  if (now >= startDate && now <= endDate) {
    return 'Ongoing';
  }
  
  if (now > regDeadline) {
    return 'Registration Closed';
  }
  
  if (event.currentRegistrations >= event.maxCapacity) {
    return event.allowWaitlist ? 'Full (Waitlist Open)' : 'Full';
  }
  
  return 'Upcoming';
};

export const getStatusColor = (status) => {
  const colors = {
    'Upcoming': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Ongoing': 'bg-green-100 text-green-800 border-green-200',
    'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Draft': 'bg-gray-100 text-gray-600 border-gray-200',
    'Registration Closed': 'bg-amber-100 text-amber-800 border-amber-200',
    'Full': 'bg-amber-100 text-amber-800 border-amber-200',
    'Full (Waitlist Open)': 'bg-amber-100 text-amber-800 border-amber-200',
    'Confirmed': 'bg-green-100 text-green-800 border-green-200',
    'Waitlisted': 'bg-amber-100 text-amber-800 border-amber-200',
    'Cancelled_reg': 'bg-red-100 text-red-800 border-red-200',
    'Present': 'bg-green-100 text-green-800 border-green-200',
    'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
    'Absent': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getStatusHex = (status) => {
  const colors = {
    'Upcoming': '#0891B2',
    'Ongoing': '#16A34A',
    'Completed': '#71717A',
    'Cancelled': '#DC2626',
    'Draft': '#A0A0AB',
    'Registration Closed': '#D97706',
    'Full': '#D97706',
    'Full (Waitlist Open)': '#D97706',
    'Confirmed': '#16A34A',
    'Waitlisted': '#D97706',
    'Present': '#16A34A',
    'Pending': '#71717A',
    'Absent': '#DC2626',
  };
  return colors[status] || '#71717A';
};
