import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { authAPI } from '../../api/index.js';
import { getPasswordStrength } from '../../utils/validators.js';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');
  const passwordStrength = getPasswordStrength(password);
  
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.resetPassword(token, data.password);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Reset Password</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          required
          {...register('password', { 
            required: 'Password is required',
            minLength: { value: 6, message: 'At least 6 characters' }
          })}
          error={errors.password?.message}
        />
        {password && (
          <div>
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
        
        <Input
          label="Confirm New Password"
          type="password"
          required
          {...register('confirmPassword', { 
            required: 'Please confirm password',
            validate: (val) => val === password || 'Passwords do not match'
          })}
          error={errors.confirmPassword?.message}
        />
        
        <Button type="submit" className="w-full" loading={loading}>
          Reset Password
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-neutral-600">
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
