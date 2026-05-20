import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/axios';
import { queryClient } from '../../../api/queryClient';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),

  email: z.string().email('Invalid email address'),

  mobile: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits'),

  password: z.string().min(6, 'Password must be at least 6 characters'),

  role: z.enum(['admin', 'sales', 'marketing']),
});

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'sales',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),

    onSuccess: (response) => {
      queryClient.setQueryData(['authUser'], response.data.user);

      toast.success('Registration successful');

      navigate('/');
    },

    onError: (error) => {
      toast.error(error.response?.data?.error || 'Registration failed');
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create an account
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 transition-colors hover:text-blue-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Mobile Number"
              type="tel"
              autoComplete="tel"
              {...register('mobile')}
              error={errors.mobile?.message}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm bg-white"
              >
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="text-xs font-semibold text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              isLoading={registerMutation.isPending}
            >
              Sign up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;