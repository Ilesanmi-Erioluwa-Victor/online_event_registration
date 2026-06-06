import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getPasswordStrength, validatePhone } from '../../utils/validators.js';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('password', '');
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!data.terms) {
      toast.error('Please accept the terms');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, terms, ...userData } = data;
      const user = await registerUser(userData);
      toast.success('Account created successfully!');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/participant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Create your account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          required
          {...register('fullName', { required: 'Full name is required', minLength: 2 })}
          error={errors.fullName?.message}
        />
        
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
        
        <Input
          label="Phone"
          type="tel"
          placeholder="+234 800 000 0000"
          required
          {...register('phone', { 
            required: 'Phone is required',
            validate: (val) => validatePhone(val) || 'Invalid phone number'
          })}
          error={errors.phone?.message}
        />
        
        <Input
          label="Organization (Optional)"
          placeholder="Your company or school"
          {...register('organization')}
        />
        
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' }
            })}
            error={errors.password?.message}
          />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      level <= passwordStrength.strength ? passwordStrength.color : 'bg-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-500">{passwordStrength.label}</p>
            </div>
          )}
        </div>
        
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          required
          {...register('confirmPassword', { 
            required: 'Please confirm password',
            validate: (val) => val === password || 'Passwords do not match'
          })}
          error={errors.confirmPassword?.message}
        />
        
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 rounded border-neutral-300 text-primary focus:ring-primary"
            {...register('terms', { required: true })}
          />
          <span className="text-sm text-neutral-600">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </span>
        </label>
        
        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link
          to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
