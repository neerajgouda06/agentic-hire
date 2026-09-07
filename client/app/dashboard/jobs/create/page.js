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
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';

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

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
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
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Create Job Posting
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Define requirements and skill criteria for autonomous AI matching</p>
      </div>

      <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Senior Frontend Engineer" 
                {...register('title')} 
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-xs py-5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.title && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Description</Label>
              <Textarea 
                id="description" 
                rows={4} 
                placeholder="Describe role responsibilities and qualifications..." 
                {...register('description')} 
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.description && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="required_skills" className="text-xs font-bold text-slate-700 dark:text-slate-300">Required Skills (Comma-separated)</Label>
              <Input 
                id="required_skills" 
                placeholder="React, Node.js, TypeScript" 
                {...register('required_skills')} 
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-xs py-5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.required_skills && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.required_skills.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preferred_skills" className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Skills (Optional)</Label>
              <Input 
                id="preferred_skills" 
                placeholder="AWS, Docker, GraphQL" 
                {...register('preferred_skills')} 
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl text-xs py-5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="min_experience" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Minimum Experience (Years)
                </Label>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {watch('min_experience') === 0 ? 'Entry Level / Fresher' : `${watch('min_experience')} ${watch('min_experience') === 1 ? 'Year' : 'Years'} Required`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Custom Modern Stepper */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      const curr = Number(watch('min_experience')) || 0;
                      if (curr > 0) setValue('min_experience', curr - 1, { shouldValidate: true });
                    }}
                    disabled={Number(watch('min_experience')) <= 0}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Decrease experience"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <input
                    id="min_experience"
                    type="number"
                    min="0"
                    max="50"
                    {...register('min_experience')}
                    className="w-16 bg-transparent text-center text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      const curr = Number(watch('min_experience')) || 0;
                      setValue('min_experience', curr + 1, { shouldValidate: true });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    aria-label="Increase experience"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[0, 1, 2, 3, 5].map((years) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setValue('min_experience', years, { shouldValidate: true })}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        Number(watch('min_experience')) === years
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {years === 0 ? '0 (Entry)' : `${years}+ Yrs`}
                    </button>
                  ))}
                </div>
              </div>
              {errors.min_experience && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.min_experience.message}</p>}
            </div>

            {error && (
              <div className="text-rose-700 dark:text-rose-400 text-xs font-semibold p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <div className="flex justify-end items-center pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.push('/dashboard/jobs')}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                {isSubmitting ? 'Saving...' : 'Publish Job Posting'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
