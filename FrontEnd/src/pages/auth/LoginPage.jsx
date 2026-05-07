import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { loginThunk, selectIsAuthenticated, selectIsLoading } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginThunk(data));
      if (loginThunk.fulfilled.match(resultAction)) {
        toast.success('Welcome back!');
        navigate('/dashboard', { replace: true });
      } else {
        if (resultAction.payload) {
          toast.error(resultAction.payload);
        } else {
          toast.error('Login failed');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-violet-800 p-12 text-white flex-col justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">MBO Portal</span>
        </div>
        
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Elevate Your Performance Management
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Align objectives, empower employees, and drive results with our comprehensive MBO framework.
          </p>
        </div>

        <div className="text-sm text-indigo-200">
          Enterprise Edition v4.2
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors 
                    focus:outline-none focus:ring-1 
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}
                  `}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            Having trouble signing in? <a href="#" className="text-indigo-600 hover:underline">Contact HR Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
