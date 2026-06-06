import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { eventsAPI, categoriesAPI } from '../../api/index.js';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, catRes] = await Promise.all([
          eventsAPI.getById(id),
          categoriesAPI.getAll(),
        ]);
        setEvent(eventRes.data);
        setCategories(catRes.data);

        const e = eventRes.data;
        reset({
          title: e.title,
          description: e.description,
          category: e.category._id || e.category,
          eventType: e.eventType,
          location: e.location,
          virtualLink: e.virtualLink,
          startDate: e.startDate?.split('T')[0],
          endDate: e.endDate?.split('T')[0],
          startTime: e.startTime,
          endTime: e.endTime,
          registrationDeadline: e.registrationDeadline?.split('T')[0],
          maxCapacity: e.maxCapacity,
          isFree: e.isFree,
          ticketPrice: e.ticketPrice,
          allowWaitlist: e.allowWaitlist,
          tags: e.tags?.join(', '),
        });
      } catch (err) {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await eventsAPI.update(id, {
        ...data,
        maxCapacity: parseInt(data.maxCapacity),
        ticketPrice: data.isFree ? 0 : parseFloat(data.ticketPrice || 0),
      });
      toast.success('Event updated');
      navigate(`/organizer/events/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await eventsAPI.cancel(id, cancelReason);
      toast.success('Event cancelled');
      navigate(`/organizer/events/${id}`);
    } catch (err) {
      toast.error('Failed to cancel event');
    } finally {
      setCancelLoading(false);
    }
  };
  
  if (loading) return <PageWrapper><div>Loading...</div></PageWrapper>;
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Edit Event</h1>
        <p className="text-neutral-600">{event?.title}</p>
      </div>
      
      {event?.currentRegistrations > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 mb-4">
          ⚠️ This event has {event.currentRegistrations} registrations. Editing may affect participants.
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 max-w-3xl space-y-4">
        <Input
          label="Event Title"
          required
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
        />
        <div>
          <label className="label">Category <span className="text-red-500">*</span></label>
          <select className="input-field" {...register('category', { required: true })}>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Event Type</label>
          <select className="input-field" {...register('eventType')}>
            <option value="Physical">Physical</option>
            <option value="Virtual">Virtual</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input-field" rows="3" {...register('description', { required: true })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Start Date" type="date" {...register('startDate', { required: true })} />
          <Input label="End Date" type="date" {...register('endDate', { required: true })} />
          <Input label="Start Time" type="time" {...register('startTime', { required: true })} />
          <Input label="End Time" type="time" {...register('endTime', { required: true })} />
        </div>
        <Input label="Registration Deadline" type="date" {...register('registrationDeadline', { required: true })} />
        <Input label="Location" required {...register('location', { required: true })} />
        <Input label="Virtual Link" {...register('virtualLink')} />
        <Input
          label="Maximum Capacity"
          type="number"
          required
          {...register('maxCapacity', { required: true, min: event?.currentRegistrations || 1 })}
        />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isFree" {...register('isFree')} />
          <label htmlFor="isFree">Free event</label>
        </div>
        <Input label="Ticket Price (NGN)" type="number" step="0.01" {...register('ticketPrice')} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="allowWaitlist" {...register('allowWaitlist')} />
          <label htmlFor="allowWaitlist">Allow waitlist</label>
        </div>
        <Input label="Tags" {...register('tags')} />
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4 border-t">
          <Button type="button" variant="danger" onClick={() => setShowCancelDialog(true)}>
            Cancel Event
          </Button>
          <Button type="submit" loading={submitLoading}>Save Changes</Button>
        </div>
      </form>

      <Modal isOpen={showCancelDialog} onClose={() => setShowCancelDialog(false)} title="Cancel Event" size="md">
        <p className="mb-4 text-neutral-600">
          Are you sure you want to cancel this event? All registrants will be notified.
        </p>
        <textarea
          className="input-field mb-4"
          rows="3"
          placeholder="Reason for cancellation..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          disabled={cancelLoading}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowCancelDialog(false)} disabled={cancelLoading}>
            Keep Event
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelLoading}>
            Cancel Event
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default EditEvent;
