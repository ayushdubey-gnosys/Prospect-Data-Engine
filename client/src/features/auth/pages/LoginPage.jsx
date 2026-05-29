import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import {
  ShieldCheck,
  Database,
  ArrowRight,
} from 'lucide-react';

import api from '../../../api/axios';
import { queryClient } from '../../../api/queryClient';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data) =>
      api.post('/auth/login', data),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ['authUser'],
        response.data.user
      );

      toast.success('Login successful');

      navigate(from, { replace: true });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
        'Login failed'
      );
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">

        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
          alt="PDE Dashboard"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-14 text-white">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                PDE
              </h1>

              <p className="text-sm text-white/70">
                Dwarkadhish Group - Prospect Data Engine
              </p>  
            </div>
          </div>

          {/* Center Content */}
          <div className="max-w-xl space-y-6">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Prospect Data Engine - Secure Centeralized Data  Platform
            </div>

            <h2 className="text-5xl font-semibold leading-tight">
              Smart centralized database management for growing business ecosystems.
            </h2>

            <p className="text-white/70 text-sm leading-relaxed">
              Prospect Data Engine is a centralized database platform designed to simplify business data management for sales and marketing teams. It enables users to upload, manage, filter, and export company records efficiently while maintaining complete activity history. The platform provides a clean workflow, secure data handling, and a modern interface for better productivity.
            </p>

          </div>

          {/* Bottom */}
          <div className="flex items-center gap-2 text-sm text-white/60">

            <span>© 2026 Dwarakadhish Group </span>
          </div>

        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 bg-white">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                PDE
              </h1>

              <p className="text-sm text-gray-500">
                Prospect Data Engine
              </p>
            </div>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <h2 className="text-4xl font-semibold text-gray-900">
              Welcome back
            </h2>

            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Sign in to continue managing your
              company and prospect data.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
                autoComplete="email"
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
                autoComplete="current-password"
              />

              {errors.password && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {loginMutation.isPending
                ? 'Signing in...'
                : 'Sign In'}

              {!loginMutation.isPending && (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center">

            <p className="text-sm text-gray-500">
              Don’t have an account?{' '}

              <Link
                to="/register"
                className="text-black font-medium hover:underline"
              >
                Create account
              </Link>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;