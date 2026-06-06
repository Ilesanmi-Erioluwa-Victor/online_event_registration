import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { eventsAPI, registrationsAPI } from '../../api/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { validatePhone } from '../../utils/validators.js';

const RegisterForEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      organization: user?.organization || '',
    },
  });
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsAPI.getById(id);
        setEvent(response.data);
        if (response.data?.userRegistration) {
          const reg = response.data.userRegistration;
          if (reg.status === 'Confirmed' || reg.status === 'Waitlisted') {
            toast.error(`You are already ${reg.status === 'Confirmed' ? 'registered' : 'on the waitlist'} for this event`);
            navigate(`/participant/events/${id}`);
          }
        }
      } catch (err) {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const [submitLoading, setSubmitLoading] = useState(false);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const customFieldValues = (event.customFields || []).map(field => ({
        fieldName: field.fieldName,
        value: data[`custom_${field.fieldName}`] || '',
      })).filter(f => f.value);

      const response = await registrationsAPI.create({
        eventId: id,
        ...data,
        customFieldValues,
      });

      setResult(response.data);
      setSubmitted(true);
      toast.success('Registration successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) return <PageWrapper><div>Loading...</div></PageWrapper>;
  if (!event) return <PageWrapper><div>Event not found</div></PageWrapper>;
  
  if (submitted) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {result.waitlisted ? 'Added to Waitlist!' : 'Registration Confirmed!'}
            </h1>
            
            {!result.waitlisted ? (
              <>
                <p className="text-neutral-600 mb-6">You are now registered for this event.</p>
                <div className="bg-primary-pale rounded-lg p-4 mb-6">
                  <div className="text-sm text-neutral-600">Registration Code</div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {result.registration.registrationCode}
                  </div>
                  <div className="text-sm text-neutral-600 mt-2">Ticket Number</div>
                  <div className="text-lg font-mono">{result.registration.ticketNumber}</div>
                </div>
                <p className="text-sm text-neutral-500 mb-6">
                  A confirmation email with your PDF ticket has been sent to your email.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link to={`/participant/registrations/${result.registration._id}/ticket`}>
                    <Button>View Ticket</Button>
                  </Link>
                  <Link to="/participant/dashboard">
                    <Button variant="ghost">Go to Dashboard</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-neutral-600 mb-4">
                  The event is at full capacity. You've been added to the waitlist.
                </p>
                <p className="text-sm text-neutral-500 mb-6">
                  We'll notify you if a spot opens up.
                </p>
                <Link to="/participant/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link to={`/participant/events/${id}`} className="text-primary hover:underline text-sm">
            ← Back to Event
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Complete Registration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
              <Input
                label="Full Name"
                required
                {...register('fullName', { required: 'Name is required' })}
                error={errors.fullName?.message}
              />
              <Input
                label="Email"
                type="email"
                required
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                required
                {...register('phone', { 
                  required: 'Phone is required',
                  validate: (val) => validatePhone(val) || 'Invalid phone'
                })}
                error={errors.phone?.message}
              />
              <Input
                label="Organization (Optional)"
                {...register('organization')}
              />
              
              {event.customFields?.length > 0 && (
                <>
                  <h3 className="font-semibold pt-2 border-t">Additional Information</h3>
                  {event.customFields.map((field, idx) => (
                    <div key={idx}>
                      <label className="label">
                        {field.fieldName}
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.fieldType === 'textarea' ? (
                        <textarea
                          className="input-field"
                          rows="3"
                          {...register(`custom_${field.fieldName}`, { 
                            required: field.isRequired 
                          })}
                        />
                      ) : field.fieldType === 'select' ? (
                        <select
                          className="input-field"
                          {...register(`custom_${field.fieldName}`, { 
                            required: field.isRequired 
                          })}
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.fieldType}
                          className="input-field"
                          {...register(`custom_${field.fieldName}`, { 
                            required: field.isRequired 
                          })}
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
              
              <Button type="submit" className="w-full" loading={submitLoading}>
                Complete Registration
              </Button>
            </form>
          </div>
          
          <div>
            <div className="card p-4 sticky top-20">
              <h3 className="font-semibold mb-3">Event Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{event.title}</div>
                <div className="text-neutral-600">{formatDate(event.startDate)} • {event.startTime}</div>
                <div className="text-neutral-600 truncate">{event.location}</div>
                <div className="pt-2 mt-2 border-t">
                  <span className="text-neutral-500">Price: </span>
                  <span className="font-bold text-accent">
                    {event.isFree ? 'Free' : formatCurrency(event.ticketPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default RegisterForEvent;
