const { z } = require('zod');

const createJobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  required_skills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  preferred_skills: z.array(z.string()).optional(),
  min_experience: z.number().min(0).optional(),
});

module.exports = {
  createJobSchema,
};
