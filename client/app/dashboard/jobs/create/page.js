'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  required_skills: z.string().min(1, 'Required skills are needed (comma separated)'),
  preferred_skills: z.string().optional(),
  min_experience: z.coerce.number().min(0, 'Must be 0 or greater'),
});

export default function CreateJobPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      required_skills: '',
      preferred_skills: '',
      min_experience: 0,
    }
  });

  const onSubmit = async (values) => {
    try {
      setError('');
      // Parse comma separated string to arrays
      const payload = {
        ...values,
        required_skills: values.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_skills: values.preferred_skills ? values.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      await api.post('/jobs', payload);
      router.push('/dashboard/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" placeholder="e.g. Frontend Developer" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" rows={5} placeholder="Describe the role..." {...register('description')} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_skills">Required Skills (comma separated)</Label>
              <Input id="required_skills" placeholder="React, Node.js, TypeScript" {...register('required_skills')} />
              {errors.required_skills && <p className="text-sm text-red-500">{errors.required_skills.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_skills">Preferred Skills (comma separated)</Label>
              <Input id="preferred_skills" placeholder="AWS, Docker" {...register('preferred_skills')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_experience">Minimum Experience (Years)</Label>
              <Input id="min_experience" type="number" {...register('min_experience')} />
              {errors.min_experience && <p className="text-sm text-red-500">{errors.min_experience.message}</p>}
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create Job'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
