'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PublicJobPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        setError('Job not found');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-medium">
        Loading job posting details...
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-medium">
        {error || 'Job posting not found.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 py-12 px-4 selection:bg-indigo-500 selection:text-white relative">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Bar with Brand & Theme Toggle */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-black tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            AgentHire
          </Link>
          <ThemeToggle />
        </div>

        {/* Job Header Card */}
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  <span>AgentHire Verified Position</span>
                </div>
                <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{job.title}</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
              </div>

              <Link href={`/jobs/${job._id}/apply`}>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-sm transition-all">
                  Apply Now →
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            
            <section>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About the Role</h3>
              <p className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {job.description}
              </p>
            </section>
            
            <section>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Minimum Experience Required</h3>
              <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 text-xs px-3 py-1 font-semibold">
                {job.min_experience || 0}+ Years Professional Experience
              </Badge>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <Badge key={index} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 text-xs px-3 py-1 font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {job.preferred_skills && job.preferred_skills.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferred_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 text-xs px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link href={`/jobs/${job._id}/apply`}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-5 rounded-xl shadow-sm transition-all">
                  Submit Application for {job.title}
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
