const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/job.controller');
const { validateRequest } = require('../validators/auth.validator'); // Reusing the validator middleware wrapper
const { createJobSchema } = require('../validators/job.validator');
const { protect, recruiter, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, recruiter, validateRequest(createJobSchema), createJob)
  .get(optionalAuth, getJobs);


router.route('/:id')
  .get(getJobById) // Public
  .put(protect, recruiter, validateRequest(createJobSchema), updateJob)
  .delete(protect, recruiter, deleteJob);

module.exports = router;
