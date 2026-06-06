export const calculateEventStatus = (event) => {
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

export const getEventStatusColor = (status) => {
  const colors = {
    'Upcoming': '#0891B2',
    'Ongoing': '#16A34A',
    'Completed': '#71717A',
    'Cancelled': '#DC2626',
    'Draft': '#A0A0AB',
    'Registration Closed': '#D97706',
    'Full': '#D97706',
    'Full (Waitlist Open)': '#D97706',
  };
  return colors[status] || '#71717A';
};

export const getRegistrationStatusColor = (status) => {
  const colors = {
    'Confirmed': '#16A34A',
    'Waitlisted': '#D97706',
    'Cancelled': '#DC2626',
  };
  return colors[status] || '#71717A';
};

export const getAttendanceStatusColor = (status) => {
  const colors = {
    'Pending': '#71717A',
    'Present': '#16A34A',
    'Absent': '#DC2626',
  };
  return colors[status] || '#71717A';
};