'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { socket } from '@/lib/socket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  // Custom Centered Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, candidate: null });

  useEffect(() => {
    fetchCandidates();
    
    // Connect to WebSockets for real-time updates
    socket.connect();
    
    socket.on('candidate:new', (newCandidate) => {
      setCandidates((prev) => {
        if (prev.find(c => c._id === newCandidate._id)) return prev;
        return [newCandidate, ...prev];
      });
    });

    socket.on('candidate:updated', (updatedCandidate) => {
      setCandidates((prev) =>
        prev.map((c) => (c._id === updatedCandidate._id ? updatedCandidate : c))
      );
    });

    return () => {
      socket.off('candidate:new');
      socket.off('candidate:updated');
      socket.disconnect();
    };
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/candidates');
      setCandidates(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCandidate = async () => {
    if (!deleteModal.candidate) return;
    const candidateId = deleteModal.candidate._id;
    setDeletingId(candidateId);
    try {
      await api.delete(`/candidates/${candidateId}`);
      setCandidates(candidates.filter(c => c._id !== candidateId));
      setDeleteModal({ open: false, candidate: null });
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      alert('Failed to delete candidate');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted': 
        return <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">Shortlisted</Badge>;
      case 'rejected': 
        return <Badge className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold">Rejected</Badge>;
      case 'review': 
        return <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">Under Review</Badge>;
      case 'waiting_approval': 
        return (
          <Badge className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Waiting Approval
          </Badge>
        );
      case 'hired': 
        return <Badge className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">Hired</Badge>;
      default: 
        return <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700">Pending</Badge>;
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (filter === 'waiting') return c.status === 'waiting_approval';
    if (filter === 'shortlisted') return c.status === 'shortlisted' || c.status === 'hired';
    if (filter === 'rejected') return c.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        Loading candidates directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Candidate Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time candidate submissions & AI match status</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({candidates.length})
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'waiting' ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Approval ({candidates.filter(c => c.status === 'waiting_approval').length})
          </button>
          <button
            onClick={() => setFilter('shortlisted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'shortlisted' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Shortlisted ({candidates.filter(c => c.status === 'shortlisted' || c.status === 'hired').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'rejected' ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Rejected ({candidates.filter(c => c.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Candidates Table Container */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-4">Candidate</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Role</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Match Score</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workflow Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applied On</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm font-medium">
                  No candidate records matching this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate._id} className="border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-sm text-indigo-700 dark:text-indigo-300">
                        {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <Link href={`/dashboard/candidates/${candidate._id}`} className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">
                          {candidate.name}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {candidate.job_id?.title || 'General Applicant'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 rounded-full h-2 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (candidate.match_score || 0) >= 80 ? 'bg-emerald-500' : (candidate.match_score || 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${candidate.match_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{candidate.match_score || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(candidate.status)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link 
                      href={`/dashboard/candidates/${candidate._id}`} 
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all shadow-2xs"
                    >
                      View Profile →
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteModal({ open: true, candidate })}
                      className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-2xs"
                    >
                      🗑️
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modern Delete Candidate Modal (Light + Dark) */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-xl mx-auto font-bold">
              👤
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Candidate Record</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-bold text-rose-600 dark:text-rose-400">"{deleteModal.candidate?.name}"</span>?
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">This will permanently erase their resume data, match scores, and interview logs.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteModal({ open: false, candidate: null })}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>

              <Button
                disabled={deletingId === deleteModal.candidate?._id}
                onClick={confirmDeleteCandidate}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-5 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {deletingId === deleteModal.candidate?._id ? 'Deleting...' : 'Yes, Delete Record'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
