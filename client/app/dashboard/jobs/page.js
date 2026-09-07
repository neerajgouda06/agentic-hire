'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Custom Centered Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, job: null });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyApplyLink = (jobId) => {
    const link = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(jobId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDeleteJob = async () => {
    if (!deleteModal.job) return;
    const jobId = deleteModal.job._id;
    setDeletingId(jobId);
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
      setDeleteModal({ open: false, job: null });
    } catch (err) {
      console.error('Failed to delete job:', err);
      alert('Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm font-medium">
        Loading job postings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Job Postings
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Manage active recruitment roles and share applicant links</p>
        </div>

        <Link href="/dashboard/jobs/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all">
            + Create New Job
          </Button>
        </Link>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-4">Job Title</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Required Experience</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Created Date</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm font-medium">
                  No job postings created yet. Click "Create New Job" above to get started!
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job._id} className="border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm shadow-2xs">
                        💼
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-md">{job.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs px-2.5 py-0.5 font-bold">
                      {job.min_experience || 0}+ Years
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyApplyLink(job._id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs ${
                        copiedId === job._id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                          : 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-200 dark:hover:border-indigo-800'
                      }`}
                    >
                      {copiedId === job._id ? '✓ Copied Link' : '🔗 Copy Apply Link'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteModal({ open: true, job })}
                      className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs"
                    >
                      🗑️ Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modern Delete Modal (Light + Dark) */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-xl mx-auto font-bold">
              🗑️
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Job Posting</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-bold text-rose-600 dark:text-rose-400">"{deleteModal.job?.title}"</span>?
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">This action is permanent and cannot be undone.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteModal({ open: false, job: null })}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>

              <Button
                disabled={deletingId === deleteModal.job?._id}
                onClick={confirmDeleteJob}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-5 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {deletingId === deleteModal.job?._id ? 'Deleting...' : 'Yes, Delete Job'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
