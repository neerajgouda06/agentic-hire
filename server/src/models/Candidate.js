const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  resume_url: {
    type: String,
    required: true,
  },
  parsed_resume_json: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  match_score: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'review', 'shortlisted', 'rejected', 'hired', 'waiting_approval'],
    default: 'pending',
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  missing_skills: {
    type: [String],
    default: [],
  },
  interview_questions: {
    type: [String],
    default: [],
  },
  coding_task: {
    type: String,
    default: '',
  },
  email_output: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  workflow_logs: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
