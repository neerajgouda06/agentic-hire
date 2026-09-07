'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CandidateDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Centered Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await api.get(`/candidates/${id}`);
        setCandidate(res.data);
      } catch (err) {
        console.error('Error loading candidate details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  const handleApproval = async (decision) => {
    setActionLoading(true);
    try {
      await api.post('/workflow/approve', {
        candidate_id: id,
        decision
      });
      const res = await api.get(`/candidates/${id}`);
      setCandidate(res.data);
    } catch (err) {
      console.error('Error processing approval:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteCandidate = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/candidates/${id}`);
      router.push('/dashboard/candidates');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      alert('Failed to delete candidate');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm font-medium">
        Loading candidate profile & AI trace...
      </div>
    );
  }
  
  if (!candidate) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Candidate record not found.
      </div>
    );
  }

  const parsed = candidate.parsed_resume_json || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner & Actions Header */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-md shadow-indigo-500/20">
              {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{candidate.name}</h1>
                <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-0.5 font-bold">
                  {candidate.match_score || 0}% Match
                </Badge>
                <Badge className={`capitalize text-xs font-semibold ${
                  candidate.status === 'shortlisted' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  candidate.status === 'waiting_approval' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' :
                  candidate.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}>
                  {candidate.status === 'waiting_approval' ? 'Waiting Approval' : candidate.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{candidate.email} • {candidate.phone || 'No phone provided'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Applied for: <span className="text-slate-800 dark:text-slate-200 font-bold">{candidate.job_id?.title || 'Role'}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Recruiter Checkpoint Action Bar */}
            {candidate.status === 'waiting_approval' ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/90 dark:border-amber-800 shadow-2xs w-full md:w-auto">
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Recruiter Checkpoint
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">Human approval required to proceed</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-lg transition-all shadow-sm" 
                    disabled={actionLoading}
                    onClick={() => handleApproval('shortlisted')}
                  >
                    Approve Candidate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="text-xs font-bold px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                    disabled={actionLoading}
                    onClick={() => handleApproval('rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (candidate.status === 'shortlisted' && (!candidate.interview_questions || candidate.interview_questions.length === 0)) && (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                disabled={actionLoading}
                onClick={() => handleApproval('shortlisted')}
              >
                🤖 Generate Interview & Email
              </Button>
            )}

            {/* Delete Candidate Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => setDeleteModalOpen(true)}
              className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs"
            >
              🗑️ Delete Profile
            </Button>
          </div>

        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Parsed Skills & Interview Questions */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Parsed Resume Details Card */}
          <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📄</span> Parsed Resume & Skill Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Extracted by AI Resume Parser Node</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Parsed Experience:</span>
                <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-0.5 font-bold">
                  {typeof parsed.experience_years === 'number' 
                    ? (parsed.experience_years === 0 ? '0 Years (Fresher / Entry-Level)' : `${parsed.experience_years} Year${parsed.experience_years > 1 ? 's' : ''}`)
                    : 'Not Specified'}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Extracted Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {parsed.skills && parsed.skills.length > 0 ? (
                    parsed.skills.map((skill, i) => (
                      <Badge key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1 font-semibold">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills parsed yet</span>
                  )}
                </div>
              </div>

              {candidate.missing_skills && candidate.missing_skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2.5">Missing Skill Gaps</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill, i) => (
                      <Badge key={i} className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs px-2.5 py-1 font-semibold">
                        ⚠️ {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {parsed.education && parsed.education.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Education</h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {parsed.education.map((edu, i) => (
                      <li key={i}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI-Generated Interview Questions */}
          <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/80 pb-4">
              <CardTitle className="text-base font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <span>🤖</span> AI-Generated Interview Questions
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700 dark:text-indigo-400">Generated by Interview Agent based on candidate skill gaps</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {candidate.interview_questions && candidate.interview_questions.length > 0 ? (
                <ol className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
                  {candidate.interview_questions.map((q, idx) => (
                    <li key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-3 leading-relaxed font-medium">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {candidate.status === 'waiting_approval' 
                    ? 'Approve candidate above to trigger Interview Agent question generation.'
                    : 'No interview questions generated yet.'}
                </p>
              )}

              {candidate.coding_task && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Targeted Coding Task</h4>
                  <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 leading-relaxed overflow-x-auto shadow-inner">
                    {candidate.coding_task}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Application Documents & Email Log */}
        <div className="space-y-6">
          
          <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Application Document</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${candidate.resume_url?.startsWith('/') ? '' : '/'}${candidate.resume_url?.replace(/\\/g, '/')}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 p-3.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold text-xs transition-all duration-200 shadow-2xs"
              >
                📄 Open Original PDF Resume
              </a>
            </CardContent>
          </Card>

          {/* Email Output Log */}
          <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Email Output Log</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Generated by Email Agent</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {candidate.email_output ? (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-300"><span className="font-bold text-slate-900 dark:text-white">To:</span> {candidate.email_output.to}</p>
                    {candidate.email_output.delivered ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                        Sent via {candidate.email_output.provider || 'Email'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700">Logged</Badge>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300"><span className="font-bold text-slate-900 dark:text-white">Subject:</span> {candidate.email_output.subject}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                    {candidate.email_output.body}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Email workflow pending completion.</p>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Modern Delete Candidate Profile Modal (Light + Dark) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-xl mx-auto font-bold">
              👤
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Candidate Profile</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-bold text-rose-600 dark:text-rose-400">"{candidate.name}"</span>?
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">This will permanently delete their parsed resume, evaluation scores, and email logs.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>

              <Button
                disabled={actionLoading}
                onClick={confirmDeleteCandidate}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-5 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Profile'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
