import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { authAPI } from '../../api/index.js';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password?</h2>
      <p className="text-neutral-600 mb-6">
        Enter your email and we'll send you a reset link.
      </p>
      
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          <p className="font-medium">Check your email</p>
          <p className="text-sm mt-1">We've sent a password reset link to your email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
            })}
            error={errors.email?.message}
          />
          
          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      )}
      
      <div className="mt-6 text-center text-sm text-neutral-600">
        Remember your password?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
