const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { runPostApprovalWorkflow } = require('../ai/workflow');
const socket = require('../utils/socket');
const { protect } = require('../middleware/auth.middleware');
const { workflowApp } = require('../ai/workflow');

// POST /workflow/start - Manually start workflow for a candidate
router.post('/start', protect, async (req, res) => {
  try {
    const { candidate_id } = req.body;
    if (!candidate_id) {
      return res.status(400).json({ error: 'candidate_id is required' });
    }

    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    workflowApp.invoke({
      candidateId: candidate._id.toString(),
      jobId: candidate.job_id.toString(),
      resumePath: candidate.resume_url
    }).catch(err => console.error(`[Workflow Start Error]:`, err));

    res.json({ message: 'Workflow execution started', candidate_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /workflow/retry - Retry a failed workflow for a candidate
router.post('/retry', protect, async (req, res) => {
  try {
    const { candidate_id } = req.body;
    if (!candidate_id) {
      return res.status(400).json({ error: 'candidate_id is required' });
    }

    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    candidate.status = 'pending';
    await candidate.save();

    workflowApp.invoke({
      candidateId: candidate._id.toString(),
      jobId: candidate.job_id.toString(),
      resumePath: candidate.resume_url
    }).catch(err => console.error(`[Workflow Retry Error]:`, err));

    res.json({ message: 'Workflow retry started', candidate_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /workflow/approve - Approve or reject candidate in human approval stage
router.post('/approve', protect, async (req, res) => {
  try {
    const { candidate_id, decision } = req.body; // decision: 'shortlisted' | 'rejected'
    if (!candidate_id || !decision) {
      return res.status(400).json({ error: 'candidate_id and decision are required' });
    }

    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    candidate.status = decision;
    await candidate.save();

    // Emit socket update
    try {
      socket.getIO().emit('candidate:updated', candidate);
    } catch (e) {
      console.log('Socket broadcast failed');
    }

    if (decision === 'shortlisted') {
      // Synchronously execute post-approval workflow (interview generation & email invite)
      await runPostApprovalWorkflow(candidate._id.toString(), candidate.job_id.toString());
      const refreshed = await Candidate.findById(candidate_id);
      try {
        socket.getIO().emit('candidate:updated', refreshed);
      } catch (e) {}
      return res.json({ message: `Candidate status updated to ${decision}`, candidate: refreshed });
    }

    res.json({ message: `Candidate status updated to ${decision}`, candidate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /workflow/:id - Get candidate workflow details
router.get('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('job_id');
    if (!candidate) {
      return res.status(404).json({ error: 'Workflow/Candidate not found' });
    }

    const nodes = [
      { id: 'resume_parser', label: 'Resume Parser', status: candidate.parsed_resume_json ? 'success' : 'pending' },
      { id: 'matching_agent', label: 'Matching Agent', status: candidate.match_score > 0 ? 'success' : (candidate.parsed_resume_json ? 'success' : 'pending') },
      { id: 'shortlisting_agent', label: 'Shortlisting Agent', status: candidate.status !== 'pending' ? 'success' : 'pending' },
      { id: 'human_approval', label: 'Human Approval', status: candidate.status === 'waiting_approval' ? 'waiting_approval' : (candidate.status === 'pending' ? 'pending' : 'success') },
      { id: 'interview_agent', label: 'Interview Agent', status: (candidate.interview_questions && candidate.interview_questions.length > 0) ? 'success' : 'pending' },
      { id: 'email_agent', label: 'Email Agent', status: candidate.email_output ? 'success' : 'pending' }
    ];

    res.json({
      candidate_id: candidate._id,
      status: candidate.status,
      nodes,
      candidate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
