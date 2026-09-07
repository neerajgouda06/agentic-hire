const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth.middleware');

// GET /analytics - Candidate and workflow statistics
router.get('/', protect, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const candidates = await Candidate.find();
    
    const totalCandidates = candidates.length;
    const shortlistedCount = candidates.filter(c => c.status === 'shortlisted' || c.status === 'hired').length;
    const waitingApprovalCount = candidates.filter(c => c.status === 'waiting_approval').length;
    const rejectedCount = candidates.filter(c => c.status === 'rejected').length;
    const pendingCount = candidates.filter(c => c.status === 'pending').length;

    const shortlistRate = totalCandidates > 0 
      ? Math.round((shortlistedCount / totalCandidates) * 100) 
      : 0;

    const avgScore = totalCandidates > 0 
      ? Math.round(candidates.reduce((acc, c) => acc + (c.match_score || 0), 0) / totalCandidates) 
      : 0;

    res.json({
      totalJobs,
      totalCandidates,
      shortlistedCount,
      waitingApprovalCount,
      rejectedCount,
      pendingCount,
      shortlistRate,
      avgScore
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
