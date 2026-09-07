'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function WorkflowsPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get('/candidates');
        setCandidates(res.data);
      } catch (err) {
        console.error('Error fetching workflows:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const getNodeStyles = (status) => {
    switch (status) {
      case 'success': 
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold shadow-2xs';
      case 'waiting_approval': 
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse shadow-2xs font-bold';
      case 'failed': 
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold';
      case 'running': 
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 animate-bounce shadow-2xs font-bold';
      default: 
        return 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 font-medium';
    }
  };

  const getWorkflowNodes = (candidate) => {
    const isParsed = !!candidate.parsed_resume_json;
    const isMatched = candidate.match_score > 0 || isParsed;
    const isShortlisted = candidate.status !== 'pending';
    const isApproval = candidate.status === 'waiting_approval';
    const isInterview = candidate.interview_questions && candidate.interview_questions.length > 0;
    const isEmail = !!candidate.email_output;

    return [
      { id: 'resume_parser', label: '1. Resume Parser', status: isParsed ? 'success' : 'pending' },
      { id: 'matching_agent', label: '2. Matching Agent', status: isMatched ? 'success' : 'pending' },
      { id: 'shortlisting_agent', label: '3. Shortlisting Agent', status: isShortlisted ? 'success' : 'pending' },
      { id: 'human_approval', label: '4. Human Approval', status: isApproval ? 'waiting_approval' : (isShortlisted ? 'success' : 'pending') },
      { id: 'interview_agent', label: '5. Interview Agent', status: isInterview ? 'success' : 'pending' },
      { id: 'email_agent', label: '6. Email Agent', status: isEmail ? 'success' : 'pending' }
    ];
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        Loading active workflow graph executions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Active Workflows Trace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time LangGraph node state visualization per candidate pipeline</p>
        </div>
      </div>

      <div className="space-y-5">
        {candidates.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
              No active workflows recorded. Post a job and apply to see the multi-agent graph execute!
            </CardContent>
          </Card>
        ) : (
          candidates.map((c) => {
            const nodes = getWorkflowNodes(c);
            return (
              <Card key={c._id} className="bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                        {c.name ? c.name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Link href={`/dashboard/candidates/${c._id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {c.name}
                          </Link>
                          <Badge variant="outline" className="text-xs bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-semibold">
                            {c.job_id?.title || 'Job Role'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 dark:text-slate-500">Pipeline Run ID: {c._id}</CardDescription>
                      </div>
                    </div>

                    <Link href={`/dashboard/candidates/${c._id}`}>
                      <Badge className={`capitalize text-xs font-semibold px-3 py-1 cursor-pointer ${
                        c.status === 'shortlisted' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        c.status === 'waiting_approval' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
                        c.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {c.status === 'waiting_approval' ? 'Waiting Approval' : c.status}
                      </Badge>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 pb-6">
                  {/* Visual Node Connector Graph */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto pb-2">
                    {nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-3 w-full md:w-auto">
                        <div className={`flex-1 md:flex-none p-3.5 rounded-xl border text-center transition-all duration-200 ${getNodeStyles(node.status)}`}>
                          <p className="text-xs font-bold whitespace-nowrap">{node.label}</p>
                          <p className="text-[10px] capitalize opacity-80 mt-1">{node.status.replace('_', ' ')}</p>
                        </div>

                        {index < nodes.length - 1 && (
                          <div className="hidden md:flex items-center justify-center">
                            <span className="text-slate-400 dark:text-slate-600 font-bold text-sm">➔</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
