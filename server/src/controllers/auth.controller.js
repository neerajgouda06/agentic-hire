const authService = require('../services/auth.service');

const signup = async (req, res) => {
  try {
    const userData = await authService.signupUser(req.body);
    res.status(201).json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const userData = await authService.loginUser(req.body);
    res.status(200).json(userData);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  getMe,
};
