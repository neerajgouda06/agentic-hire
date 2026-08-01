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

      // Don't use the standard json api client for multipart/form-data
      // But axios handles FormData correctly if we just pass it
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
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your resume has been uploaded successfully and the AI is now processing your application.</p>
            <p className="text-sm text-gray-500">We will notify you via email regarding the next steps.</p>
            <Link href={`/jobs/${jobId}`}>
              <Button variant="outline" className="mt-4">Back to Job</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit Application</CardTitle>
            <CardDescription>Fill out the form below and upload your resume to apply.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Jane Doe" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" {...register('phone')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (PDF only)</Label>
                <Input 
                  id="resume" 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                {file && <p className="text-sm text-gray-500">Selected file: {file.name}</p>}
              </div>

              {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-md">{error}</div>}

              <div className="flex justify-between items-center pt-4 border-t">
                <Link href={`/jobs/${jobId}`}>
                  <Button variant="ghost" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
