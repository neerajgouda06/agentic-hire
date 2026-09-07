'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [error, setError] = useState('');

  // Prevent logged-in users from seeing login page or going back to it
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token || isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values) => {
    try {
      setError('');
      const response = await api.post('/auth/login', values);
      setAuth(response.data, response.data.token);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AgentHire
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Autonomous Recruiter OS</p>
        </div>

        <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Log in to manage AI candidate workflows</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="recruiter@company.com" 
                  {...register('email')} 
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-xs py-5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.email && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  {...register('password')} 
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs py-5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.password && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="text-rose-700 dark:text-rose-400 text-xs font-semibold p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                  ⚠️ {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-5 rounded-xl shadow-md shadow-indigo-500/20 transition-all mt-2"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In to Command Center'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              Don't have an account? <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sign up</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
