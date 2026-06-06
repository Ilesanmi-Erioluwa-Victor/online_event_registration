import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { eventsAPI, registrationsAPI } from '../../api/index.js';
import { formatDate, formatTime } from '../../utils/formatDate.js';
import { calculateEventStatus } from '../../utils/eventStatus.js';

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [actionLoading, setActionLoading] = useState({});
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regRes] = await Promise.all([
          eventsAPI.getById(id),
          registrationsAPI.getEventRegistrations(id, { limit: 100 }),
        ]);
        setEvent(eventRes.data);
        setRegistrations(regRes.data.registrations);
      } catch (err) {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePublish = async () => {
    setActionLoading((p) => ({ ...p, publish: true }));
    try {
      await eventsAPI.publish(id);
      toast.success('Event published');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setActionLoading((p) => ({ ...p, publish: false }));
    }
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      await registrationsAPI.sendBulkEmail(id, emailData);
      toast.success('Emails sent');
      setShowEmailModal(false);
      setEmailData({ subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send emails');
    } finally {
      setEmailSending(false);
    }
  };

  const handleExport = async (format) => {
    const key = `export-${format}`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      const response = await registrationsAPI.exportRegistrations(id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants-${event.eventCode}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };
  
  if (loading) return <PageWrapper><div>Loading...</div></PageWrapper>;
  if (!event) return <PageWrapper><div>Event not found</div></PageWrapper>;
  
  const status = calculateEventStatus(event);
  const fillPercentage = event.maxCapacity > 0 ? Math.round((event.currentRegistrations / event.maxCapacity) * 100) : 0;
  
  return (
    <PageWrapper>
      <div className="mb-4">
        <Link to="/organizer/events" className="text-primary hover:underline text-sm">← Back to My Events</Link>
      </div>
      
      {/* Banner */}
      <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary-pale to-primary mb-6">
        {event.bannerImage && (
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Badge status={status}>{status}</Badge>
            <span className="text-xs font-mono opacity-80">{event.eventCode}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{event.title}</h1>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-3">
          <div className="text-xs text-neutral-500">Registered</div>
          <div className="text-xl font-bold">{event.currentRegistrations} / {event.maxCapacity}</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-neutral-500">Confirmed</div>
          <div className="text-xl font-bold text-green-600">
            {registrations.filter(r => r.status === 'Confirmed').length}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-neutral-500">Waitlisted</div>
          <div className="text-xl font-bold text-amber-600">
            {registrations.filter(r => r.status === 'Waitlisted').length}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-neutral-500">Attended</div>
          <div className="text-xl font-bold text-primary">
            {registrations.filter(r => r.attendanceStatus === 'Present').length}
          </div>
        </div>
      </div>
      
      {/* Capacity Bar */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Capacity</span>
          <span className="font-medium">{fillPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              fillPercentage < 60 ? 'bg-green-500' :
              fillPercentage < 90 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {event.status === 'Draft' && (
          <Button onClick={handlePublish} loading={actionLoading.publish}>
            <CheckBadgeIcon className="h-4 w-4" /> Publish Event
          </Button>
        )}
        <Link to={`/organizer/events/${id}/edit`}>
          <Button variant="secondary">
            <PencilSquareIcon className="h-4 w-4" /> Edit Event
          </Button>
        </Link>
        <Link to={`/organizer/events/${id}/registrations`}>
          <Button variant="secondary">
            <ClipboardDocumentListIcon className="h-4 w-4" /> View Registrations
          </Button>
        </Link>
        <Link to={`/organizer/events/${id}/attendance`}>
          <Button variant="secondary">
            <CheckBadgeIcon className="h-4 w-4" /> Mark Attendance
          </Button>
        </Link>
        <Button variant="ghost" onClick={() => setShowEmailModal(true)}>
          <EnvelopeIcon className="h-4 w-4" /> Email All
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleExport('pdf')}
          loading={actionLoading['export-pdf']}
        >
          <ArrowDownTrayIcon className="h-4 w-4" /> Export PDF
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleExport('csv')}
          loading={actionLoading['export-csv']}
        >
          <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      
      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {['overview', 'registrations', 'waitlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-neutral-700 whitespace-pre-line mb-4">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm text-neutral-500 mb-1">Date & Time</h4>
                  <p>{formatDate(event.startDate)} {event.startTime} - {event.endTime}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-neutral-500 mb-1">Location</h4>
                  <p>{event.location}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-neutral-500 mb-1">Type</h4>
                  <p>{event.eventType}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-neutral-500 mb-1">Price</h4>
                  <p>{event.isFree ? 'Free' : `NGN ${event.ticketPrice}`}</p>
                </div>
              </div>
              
              {event.tags?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm text-neutral-500 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-primary-pale text-primary text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'registrations' && (
            <div>
              <h3 className="font-semibold mb-4">Latest Registrations</h3>
              {registrations.length === 0 ? (
                <p className="text-neutral-500">No registrations yet</p>
              ) : (
                <div className="space-y-2">
                  {registrations.slice(0, 10).map((reg) => (
                    <div key={reg._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                      <div>
                        <div className="font-medium">{reg.fullName}</div>
                        <div className="text-sm text-neutral-500">{reg.email}</div>
                      </div>
                      <Badge status={reg.status}>{reg.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'waitlist' && (
            <div>
              <h3 className="font-semibold mb-4">Waitlist</h3>
              {registrations.filter(r => r.status === 'Waitlisted').length === 0 ? (
                <p className="text-neutral-500">No one on waitlist</p>
              ) : (
                <div className="space-y-2">
                  {registrations.filter(r => r.status === 'Waitlisted').map((reg) => (
                    <div key={reg._id} className="flex items-center justify-between p-3 bg-amber-50 rounded">
                      <div>
                        <div className="font-medium">{reg.fullName}</div>
                        <div className="text-sm text-neutral-500">{reg.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Email All Registrants" size="md">
        <div className="space-y-3">
          <Input
            label="Subject"
            value={emailData.subject}
            onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
            required
          />
          <div>
            <label className="label">Message</label>
            <textarea
              className="input-field"
              rows="6"
              value={emailData.message}
              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowEmailModal(false)} disabled={emailSending}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} loading={emailSending}>
              Send Email
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default OrganizerEventDetail;
