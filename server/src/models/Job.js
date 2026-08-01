const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  required_skills: [{
    type: String,
  }],
  preferred_skills: [{
    type: String,
  }],
  min_experience: {
    type: Number,
    default: 0,
  },
  workflow_spec_id: {
    type: String,
    default: 'default-hiring-workflow',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
