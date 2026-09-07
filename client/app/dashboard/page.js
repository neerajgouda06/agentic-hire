'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    shortlisted: 0,
    waitingApproval: 0,
    recentCandidates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, candidatesRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/candidates')
        ]);
        
        const jobs = jobsRes.data || [];
        const candidates = candidatesRes.data || [];
        
        const shortlistedCount = candidates.filter(c => c.status === 'shortlisted' || c.status === 'hired').length;
        const waitingApprovalCount = candidates.filter(c => c.status === 'waiting_approval').length;
        const shortlistPercentage = candidates.length > 0 
          ? Math.round((shortlistedCount / candidates.length) * 100) 
          : 0;

        setStats({
          totalJobs: jobs.length,
          totalCandidates: candidates.length,
          shortlisted: shortlistPercentage,
          waitingApproval: waitingApprovalCount,
          recentCandidates: candidates.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <span>AI Hiring OS Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Recruiter Command Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl font-normal">
            Autonomous multi-agent recruitment pipeline powered by LangGraph & Groq LLMs.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard/jobs/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 px-6 rounded-xl transition-all duration-200">
              + Post New Job
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Metric Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm glow-card-indigo">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Job Postings</CardTitle>
            <span className="text-xl">💼</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : stats.totalJobs}</div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-semibold">Open hiring routes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm glow-card-emerald">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Applicants</CardTitle>
            <span className="text-xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : stats.totalCandidates}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">Parsed PDF resumes</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm glow-card-amber">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Awaiting Approval</CardTitle>
            <span className="text-xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{loading ? '...' : stats.waitingApproval}</div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-semibold">Recruiter checkpoints</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Shortlist Rate</CardTitle>
            <span className="text-xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-violet-600 dark:text-violet-400">{loading ? '...' : `${stats.shortlisted}%`}</div>
            <p className="text-xs text-violet-700 dark:text-violet-300 mt-2 font-semibold">AI match qualification</p>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Layout Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Recent Pipeline Activity */}
        <Card className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Applications</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Latest candidate entries in the AI pipeline</CardDescription>
            </div>
            <Link href="/dashboard/candidates" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
              View All →
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {stats.recentCandidates.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                No recent candidates found. Post a job to start receiving applications!
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentCandidates.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-sm">
                        {c.name ? c.name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <Link href={`/dashboard/candidates/${c._id}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {c.name}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold">
                        {c.match_score || 0}% Match
                      </Badge>
                      <Badge className={`capitalize text-xs font-semibold ${
                        c.status === 'shortlisted' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        c.status === 'waiting_approval' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                        c.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions Panel */}
        <Card className="col-span-1 md:col-span-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Quick Navigation</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Access key recruitment modules</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-2.5">
            <Link href="/dashboard/candidates" className="block w-full">
              <Button variant="outline" className="w-full justify-between bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs py-5 transition-all duration-200 shadow-2xs">
                <span className="flex items-center gap-2">👥 Candidate Directory</span>
                <span>→</span>
              </Button>
            </Link>

            <Link href="/dashboard/workflows" className="block w-full">
              <Button variant="outline" className="w-full justify-between bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs py-5 transition-all duration-200 shadow-2xs">
                <span className="flex items-center gap-2">🔄 Workflows Trace</span>
                <span>→</span>
              </Button>
            </Link>

            <Link href="/dashboard/analytics" className="block w-full">
              <Button variant="outline" className="w-full justify-between bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs py-5 transition-all duration-200 shadow-2xs">
                <span className="flex items-center gap-2">📈 Analytics & Metrics</span>
                <span>→</span>
              </Button>
            </Link>

            <Link href="/dashboard/jobs" className="block w-full">
              <Button variant="outline" className="w-full justify-between bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs py-5 transition-all duration-200 shadow-2xs">
                <span className="flex items-center gap-2">💼 Job Postings</span>
                <span>→</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
