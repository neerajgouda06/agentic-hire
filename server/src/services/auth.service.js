const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const signupUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } else {
    throw new Error('User not found');
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserProfile,
};
