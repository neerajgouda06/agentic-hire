const express = require('express');
const { uploadCandidate, getCandidates, getCandidateById, deleteCandidate } = require('../controllers/candidate.controller');
const upload = require('../middleware/upload.middleware');
const { validateRequest } = require('../validators/auth.validator');
const { createCandidateSchema } = require('../validators/candidate.validator');
const { protect, recruiter } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/upload', upload.single('resume'), (req, res, next) => {
  // We need to parse body here since multer intercepts it
  try {
    createCandidateSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ errors: error.errors });
  }
}, uploadCandidate);

router.get('/', protect, recruiter, getCandidates);
router.get('/:id', protect, recruiter, getCandidateById);
router.delete('/:id', protect, recruiter, deleteCandidate);

module.exports = router;
