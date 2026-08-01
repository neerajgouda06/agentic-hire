const Candidate = require('../models/Candidate');

const createCandidate = async (candidateData) => {
  const candidate = await Candidate.create(candidateData);
  return candidate;
};

const getCandidates = async (filter = {}) => {
  const candidates = await Candidate.find(filter).populate('job_id', 'title').sort({ created_at: -1 });
  return candidates;
};

const getCandidateById = async (id) => {
  const candidate = await Candidate.findById(id).populate('job_id', 'title');
  return candidate;
};

module.exports = {
  createCandidate,
  getCandidates,
  getCandidateById,
};
