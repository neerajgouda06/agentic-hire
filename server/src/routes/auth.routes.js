const express = require('express');
const { signup, login, getMe } = require('../controllers/auth.controller');
const { validateRequest, signupSchema, loginSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;
