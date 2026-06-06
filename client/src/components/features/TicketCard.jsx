import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatTime } from '../../utils/formatDate.js';

const TicketCard = ({ registration, event, showQR = true }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto border border-neutral-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-dark to-primary p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm opacity-80">EventHub</div>
            <div className="text-xs opacity-60 mt-1">Register. Attend. Connect.</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">TICKET NUMBER</div>
            <div className="font-mono text-lg font-bold mt-1">
              {registration.ticketNumber}
            </div>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          {event?.title}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Date</div>
            <div className="font-medium text-neutral-800 mt-1">
              {formatDate(event?.startDate)}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Time</div>
            <div className="font-medium text-neutral-800 mt-1">
              {event?.startTime}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Location</div>
            <div className="font-medium text-neutral-800 mt-1">
              {event?.location}
            </div>
            {event?.virtualLink && (
              <a 
                href={event.virtualLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                Join Virtual Event
              </a>
            )}
          </div>
        </div>
        
        <div className="border-t border-dashed border-neutral-300 my-6"></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Participant</div>
            <div className="font-medium text-neutral-800 mt-1">
              {registration.fullName}
            </div>
            <div className="text-sm text-neutral-600 mt-1">
              {registration.email}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Registration Code</div>
            <div className="font-mono font-medium text-neutral-800 mt-1">
              {registration.registrationCode}
            </div>
          </div>
        </div>
        
        {showQR && (
          <div className="mt-6 pt-6 border-t border-neutral-200 flex justify-center">
            <div className="text-center">
              <QRCodeSVG 
                value={registration.registrationCode || registration.ticketNumber}
                size={120}
                level="H"
              />
              <div className="text-xs text-neutral-500 mt-2">
                Present this QR code at the entrance
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-neutral-50 px-6 py-3 text-center text-xs text-neutral-500">
        Please present this ticket at the event entrance
      </div>
    </div>
  );
};

export default TicketCard;
