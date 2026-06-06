import { getStatusColor } from '../../utils/eventStatus.js';

const Badge = ({ children, status, className = '' }) => {
  const colorClass = status ? getStatusColor(status) : 'bg-primary-pale text-primary border-primary';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
