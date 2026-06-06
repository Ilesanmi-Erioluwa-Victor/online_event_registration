import { useCountdown } from '../../hooks/useCountdown.js';

const CountdownTimer = ({ targetDate, className = '' }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  
  if (expired) {
    return <span className="text-neutral-500 text-sm">Event has started</span>;
  }
  
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {days > 0 && (
        <div className="text-center">
          <div className="font-bold text-primary">{days}</div>
          <div className="text-xs text-neutral-500">days</div>
        </div>
      )}
      {days > 0 && <span className="text-neutral-300">:</span>}
      <div className="text-center">
        <div className="font-bold text-primary">{String(hours).padStart(2, '0')}</div>
        <div className="text-xs text-neutral-500">hrs</div>
      </div>
      <span className="text-neutral-300">:</span>
      <div className="text-center">
        <div className="font-bold text-primary">{String(minutes).padStart(2, '0')}</div>
        <div className="text-xs text-neutral-500">min</div>
      </div>
      <span className="text-neutral-300">:</span>
      <div className="text-center">
        <div className="font-bold text-primary">{String(seconds).padStart(2, '0')}</div>
        <div className="text-xs text-neutral-500">sec</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
