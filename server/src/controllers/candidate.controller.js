const candidateService = require('../services/candidate.service');
const { workflowApp } = require('../ai/workflow');
const socket = require('../utils/socket');

const uploadCandidate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const resume_url = `/uploads/${req.file.filename}`;
    
    const candidateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      job_id: req.body.job_id,
      resume_url,
    };

    const candidate = await candidateService.createCandidate(candidateData);
    
    // Broadcast new candidate immediately
    try {
      socket.getIO().emit('candidate:new', candidate);
    } catch (e) {
      console.log('Socket not initialized or failed to emit');
    }
    
    // Auto-start workflow logic asynchronously (don't await so UI doesn't block)
    workflowApp.invoke({
      candidateId: candidate._id.toString(),
      jobId: req.body.job_id,
      resumePath: resume_url
    }).then(() => {
      console.log(`[LangGraph] Workflow completed for candidate ${candidate._id}`);
    }).catch((err) => {
      console.error(`[LangGraph] Workflow failed for candidate ${candidate._id}:`, err);
    });
    
    res.status(201).json({
      message: 'Candidate uploaded successfully. AI processing started.',
      candidate
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

const getCandidates = async (req, res) => {
  try {
    // Multi-tenancy: Only return candidates who applied to jobs created by this user
    let filter = {};
    if (req.user && req.user.role !== 'admin') {
      const myJobs = await Job.find({ creator: req.user.id }).select('_id');
      const myJobIds = myJobs.map(j => j._id);
      filter = { job_id: { $in: myJobIds } };
    }
    const candidates = await candidateService.getCandidates(filter);
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCandidateById = async (req, res) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    if (req.user && req.user.role !== 'admin') {
      const job = await Job.findById(candidate.job_id);
      if (!job || job.creator.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to view this candidate' });
      }
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    if (req.user && req.user.role !== 'admin') {
      const job = await Job.findById(candidate.job_id);
      if (!job || job.creator.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to delete this candidate' });
      }
    }
    await candidateService.deleteCandidate(req.params.id);
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadCandidate,
  getCandidates,
  getCandidateById,
  deleteCandidate,
};

