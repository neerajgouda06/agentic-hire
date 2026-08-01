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
    enum: ['pending', 'review', 'shortlisted', 'rejected', 'hired'],
    default: 'pending',
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
