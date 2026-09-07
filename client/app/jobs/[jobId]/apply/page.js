'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

export default function ApplyPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    if (!file) {
      setError('Please upload your resume (PDF)');
      return;
    }
    
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    try {
      setError('');
      
      const formData = new FormData();
      formData.append('job_id', jobId);
      formData.append('name', values.name);
      formData.append('email', values.email);
      if (values.phone) formData.append('phone', values.phone);
      formData.append('resume', file);

      await api.post('/candidates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-8 md:p-10 rounded-2xl max-w-md w-full text-center border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
            ✓
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your resume has been uploaded successfully. Our AI recruitment pipeline is now evaluating your skills & qualifications.
          </p>

          <Link href={`/jobs/${jobId}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-5 rounded-xl shadow-sm">
              Back to Job Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 py-12 px-4 selection:bg-indigo-500 selection:text-white relative">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Top Bar with Brand & Theme Toggle */}
        <div className="flex items-center justify-between">
          <Link href={`/jobs/${jobId}`} className="text-xl font-black tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            AgentHire
          </Link>
          <ThemeToggle />
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <span>AgentHire Application Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Submit Application
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upload your resume to trigger autonomous AI resume parsing & evaluation.</p>
        </div>

        {/* Form Card */}
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Jane Doe" 
                  {...register('name')} 
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:border-indigo-500 text-xs py-5"
                />
                {errors.name && <p className="text-xs text-rose-500 dark:text-rose-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="jane@example.com" 
                  {...register('email')} 
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:border-indigo-500 text-xs py-5"
                />
                {errors.email && <p className="text-xs text-rose-500 dark:text-rose-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number (optional)</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 000-0000" 
                  {...register('phone')} 
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:border-indigo-500 text-xs py-5"
                />
              </div>

              {/* PDF Resume Upload Dropzone */}
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-xs font-bold text-slate-700 dark:text-slate-300">Resume Document (PDF Only)</Label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-950 transition-colors cursor-pointer relative">
                  <input 
                    id="resume" 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <span className="text-3xl">📄</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {file ? file.name : 'Click to select or drop your PDF resume here'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Maximum size: 10MB • Format: PDF</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-rose-600 dark:text-rose-400 text-xs font-semibold p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/jobs/${jobId}`}>
                  <Button variant="ghost" type="button" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    Cancel
                  </Button>
                </Link>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-sm transition-all"
                >
                  {isSubmitting ? 'Uploading & Parsing...' : 'Submit Application'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
