import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { eventsAPI, categoriesAPI } from '../../api/index.js';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const isFree = watch('isFree');
  const eventType = watch('eventType');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const addCustomField = () => {
    setCustomFields([...customFields, { fieldName: '', fieldType: 'text', isRequired: false }]);
  };

  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index, key, value) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data, publishNow) => {
    if (publishNow) {
      setPublishLoading(true);
    } else {
      setSubmitLoading(true);
    }
    try {
      const eventData = {
        ...data,
        customFields,
        status: publishNow ? 'Published' : 'Draft',
        maxCapacity: parseInt(data.maxCapacity),
        ticketPrice: data.isFree ? 0 : parseFloat(data.ticketPrice || 0),
      };

      const response = await eventsAPI.create(eventData);
      const eventId = response.data._id;

      if (bannerFile) {
        const formData = new FormData();
        formData.append('banner', bannerFile);
        await eventsAPI.uploadBanner(eventId, formData);
      }

      if (publishNow) {
        await eventsAPI.publish(eventId);
      }

      toast.success(publishNow ? 'Event created and published!' : 'Event saved as draft');
      navigate(`/organizer/events/${eventId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitLoading(false);
      setPublishLoading(false);
    }
  };

  const steps = ['Basic Info', 'Date & Location', 'Capacity & Pricing', 'Banner & Review'];

  const nextStep = async () => {
    const form = document.querySelector('form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStep(step + 1);
  };
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Create New Event</h1>
        <p className="text-neutral-600">Fill in the details to create your event</p>
      </div>
      
      {/* Step Indicator */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= idx + 1 ? 'text-primary' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step > idx + 1 ? 'bg-primary text-white' : 
                  step === idx + 1 ? 'bg-primary text-white' : 
                  'bg-neutral-200'
                }`}>
                  {step > idx + 1 ? <CheckIcon className="h-4 w-4" /> : idx + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > idx + 1 ? 'bg-primary' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="card p-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <Input
              label="Event Title"
              required
              {...register('title', { required: 'Title is required', minLength: 3 })}
              error={errors.title?.message}
            />
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select
                className="input-field"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Event Type <span className="text-red-500">*</span></label>
              <select
                className="input-field"
                {...register('eventType', { required: 'Event type is required' })}
              >
                <option value="">Select event type</option>
                <option value="Physical">Physical</option>
                <option value="Virtual">Virtual</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label">Short Description <span className="text-red-500">*</span></label>
              <textarea
                className="input-field"
                rows="3"
                {...register('description', { required: 'Description is required', minLength: 10 })}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            <Input
              label="Tags (comma separated)"
              placeholder="tech, workshop, networking"
              {...register('tags')}
            />
          </div>
        )}
        
        {/* Step 2: Date & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Date, Time & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                required
                {...register('startDate', { required: 'Start date is required' })}
              />
              <Input
                label="End Date"
                type="date"
                required
                {...register('endDate', { required: 'End date is required' })}
              />
              <Input
                label="Start Time"
                type="time"
                required
                {...register('startTime', { required: 'Start time is required' })}
              />
              <Input
                label="End Time"
                type="time"
                required
                {...register('endTime', { required: 'End time is required' })}
              />
            </div>
            <Input
              label="Registration Deadline"
              type="date"
              required
              {...register('registrationDeadline', { required: 'Registration deadline is required' })}
            />
            <Input
              label="Location"
              placeholder="Address or 'Online'"
              required
              {...register('location', { required: 'Location is required' })}
            />
            {(eventType === 'Virtual' || eventType === 'Hybrid') && (
              <Input
                label="Virtual Link"
                placeholder="https://zoom.us/j/..."
                {...register('virtualLink')}
              />
            )}
          </div>
        )}
        
        {/* Step 3: Capacity & Pricing */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Capacity & Pricing</h2>
            <Input
              label="Maximum Capacity"
              type="number"
              required
              min="1"
              {...register('maxCapacity', { required: 'Capacity is required', min: 1 })}
            />
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFree" {...register('isFree')} />
              <label htmlFor="isFree">This is a free event</label>
            </div>
            
            {!isFree && (
              <Input
                label="Ticket Price (NGN)"
                type="number"
                step="0.01"
                required={!isFree}
                {...register('ticketPrice', { required: !isFree, min: 0 })}
              />
            )}
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="allowWaitlist" {...register('allowWaitlist')} defaultChecked />
              <label htmlFor="allowWaitlist">Allow waitlist when event is full</label>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label !mb-0">Custom Registration Fields</label>
                <Button type="button" size="sm" variant="secondary" onClick={addCustomField}>
                  + Add Field
                </Button>
              </div>
              {customFields.map((field, idx) => (
                <div key={idx} className="border border-neutral-200 rounded p-3 mb-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Field name"
                      className="input-field"
                      value={field.fieldName}
                      onChange={(e) => updateCustomField(idx, 'fieldName', e.target.value)}
                    />
                    <select
                      className="input-field"
                      value={field.fieldType}
                      onChange={(e) => updateCustomField(idx, 'fieldType', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) => updateCustomField(idx, 'isRequired', e.target.checked)}
                      />
                      <span className="text-sm">Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeCustomField(idx)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 4: Banner & Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Banner & Review</h2>
            
            <div>
              <label className="label">Event Banner (Optional)</label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                {bannerPreview ? (
                  <div className="relative">
                    <img src={bannerPreview} alt="Banner preview" className="max-h-48 mx-auto rounded" />
                    <button
                      type="button"
                      onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-8">
                    <PhotoIcon className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Click to upload banner (JPEG/PNG, max 3MB)</p>
                    <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleBannerChange} />
                  </label>
                )}
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Review</h3>
              <p className="text-sm text-neutral-600">Review all the details before publishing.</p>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeftIcon className="h-4 w-4" /> Back
            </Button>
          ) : <div />}
          
          {step < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next <ChevronRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" loading={submitLoading} disabled={publishLoading}>
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, true))}
                loading={publishLoading}
                disabled={submitLoading}
              >
                Publish Now
              </Button>
            </div>
          )}
        </div>
      </form>
    </PageWrapper>
  );
};

export default CreateEvent;
