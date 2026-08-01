const Job = require('../models/Job');

const createJob = async (jobData) => {
  const job = await Job.create(jobData);
  return job;
};

const getJobs = async (filter = {}) => {
  const jobs = await Job.find(filter).sort({ created_at: -1 });
  return jobs;
};

const getJobById = async (id) => {
  const job = await Job.findById(id);
  return job;
};

const updateJob = async (id, updateData) => {
  const job = await Job.findByIdAndUpdate(id, updateData, { new: true });
  return job;
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
};
