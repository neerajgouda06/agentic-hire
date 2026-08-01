const { z } = require('zod');

const createCandidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_id: z.string().min(1, 'Job ID is required'),
});

module.exports = {
  createCandidateSchema,
};
