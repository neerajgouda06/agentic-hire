const jobService = require('../services/job.service');

const createJob = async (req, res) => {
  try {
    const jobData = { ...req.body, creator: req.user.id };
    const job = await jobService.createJob(jobData);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    // If authenticated, return only jobs created by this user unless public query is requested
    const filter = req.user ? { creator: req.user.id } : {};
    const jobs = await jobService.getJobs(filter);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const existing = await jobService.getJobById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (existing.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }
    const job = await jobService.updateJob(req.params.id, req.body);
    res.status(200).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const existing = await jobService.getJobById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (existing.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }
    await jobService.deleteJob(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
