import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { settingsAPI } from '../../api/index.js';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      reset(response.data);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await settingsAPI.update(data);
      toast.success('Settings updated');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) return <PageWrapper><div>Loading settings...</div></PageWrapper>;
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-600">Configure platform settings</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 max-w-2xl space-y-4">
        <Input
          label="Platform Name"
          {...register('platformName', { required: true })}
        />
        <Input
          label="Tagline"
          {...register('platformTagline')}
        />
        <Input
          label="Support Email"
          type="email"
          {...register('supportEmail')}
        />
        <Input
          label="Reminder Hours Before Event"
          type="number"
          {...register('reminderHoursBefore', { valueAsNumber: true })}
        />
        <Input
          label="Max Events Per Organizer"
          type="number"
          {...register('maxEventsPerOrganizer', { valueAsNumber: true })}
        />
        
        <div className="space-y-2 pt-2 border-t">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('allowPublicRegistration')} className="rounded" />
            <span>Allow Public Registration</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('allowGuestRegistration')} className="rounded" />
            <span>Allow Guest Registration</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('requireEmailVerification')} className="rounded" />
            <span>Require Email Verification</span>
          </label>
        </div>
        
        <Button type="submit" loading={submitLoading}>Save Settings</Button>
      </form>
    </PageWrapper>
  );
};

export default Settings;
