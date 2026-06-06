import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.fullName}!`);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(`/${user.role}/dashboard`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Sign in to your account</h2>

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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-neutral-400"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Don't have an account?{' '}
        <Link
          to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
          className="text-primary font-medium hover:underline"
        >
          Register
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <p className="text-xs text-neutral-500 text-center mb-2">Test Credentials:</p>
        <div className="text-xs text-neutral-600 space-y-1">
          <div>Admin: admin@events.com / Admin@1234</div>
          <div>Organizer: organizer@events.com / Org@1234</div>
          <div>Participant: participant@events.com / Part@1234</div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
