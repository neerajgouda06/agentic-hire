const candidateService = require('../services/candidate.service');

const uploadCandidate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const resume_url = `/uploads/${req.file.filename}`;
    
    // In Phase 2, we just save it. In Phase 3/4, we will parse it.
    const candidateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      job_id: req.body.job_id,
      resume_url,
    };

    const candidate = await candidateService.createCandidate(candidateData);
    
    // Auto-start workflow logic will go here in next phases
    
    res.status(201).json({
      message: 'Candidate uploaded successfully',
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
