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

const getCandidates = async (req, res) => {
  try {
    const candidates = await candidateService.getCandidates();
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
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadCandidate,
  getCandidates,
  getCandidateById,
};
