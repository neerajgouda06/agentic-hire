'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        Computing recruitment pipeline analytics...
      </div>
    );
  }

  const total = data?.totalCandidates || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Recruitment Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Key performance metrics across candidate pipelines and AI agent execution</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Applications</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">📄</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{data?.totalCandidates || 0}</div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Across {data?.totalJobs || 0} active job postings</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Shortlist Rate</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">🎯</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{data?.shortlistRate || 0}%</div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-medium">{data?.shortlistedCount || 0} candidates shortlisted</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Awaiting Checkpoint</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-bold">⏳</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{data?.waitingApprovalCount || 0}</div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-medium">Recruiter action required</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average Match Score</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{data?.avgScore || 0}%</div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 font-medium">Across parsed resumes</p>
          </CardContent>
        </Card>

      </div>

      {/* Main Charts Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Pipeline Distribution Card */}
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Pipeline Stage Distribution</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Candidate allocation across workflow states</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            
            {/* Shortlisted */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-700 dark:text-emerald-400">Shortlisted / Hired</span>
                <span className="text-slate-600 dark:text-slate-400">{data?.shortlistedCount || 0} ({Math.round(((data?.shortlistedCount || 0)/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.round(((data?.shortlistedCount || 0)/total)*100)}%` }}></div>
              </div>
            </div>

            {/* Waiting Approval */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-700 dark:text-amber-400">Waiting Recruiter Approval</span>
                <span className="text-slate-600 dark:text-slate-400">{data?.waitingApprovalCount || 0} ({Math.round(((data?.waitingApprovalCount || 0)/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.round(((data?.waitingApprovalCount || 0)/total)*100)}%` }}></div>
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-700 dark:text-rose-400">Rejected</span>
                <span className="text-slate-600 dark:text-slate-400">{data?.rejectedCount || 0} ({Math.round(((data?.rejectedCount || 0)/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${Math.round(((data?.rejectedCount || 0)/total)*100)}%` }}></div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* AI Agent Efficiency */}
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">AI Agent Node Efficiency</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Performance metrics across LangGraph nodes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/80">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Resume Parser & Matcher</p>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">~2.8 sec</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">Parses PDF text, extracts skills & computes match score using Groq LLM</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/80">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">Interview & Coding Task Agent</p>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900">~3.5 sec</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">Generates candidate-specific technical questions targeting skill gaps</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/80">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Email Dispatcher Node</p>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">~1.2 sec</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">Renders template parameters and dispatches live email via Gmail SMTP</p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
