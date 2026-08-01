const express = require('express');
const { createJob, getJobs, getJobById, updateJob } = require('../controllers/job.controller');
const { validateRequest } = require('../validators/auth.validator'); // Reusing the validator middleware wrapper
const { createJobSchema } = require('../validators/job.validator');
const { protect, recruiter } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, recruiter, validateRequest(createJobSchema), createJob)
  .get(getJobs); // Public

router.route('/:id')
  .get(getJobById) // Public
  .put(protect, recruiter, validateRequest(createJobSchema), updateJob);

module.exports = router;
