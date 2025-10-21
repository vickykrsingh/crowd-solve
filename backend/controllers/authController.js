import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, location, bio } = req.body;

    if (!username || !email || !password) {
      return validationErrorResponse(res, {
        username: !username ? 'Username is required' : null,
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email or username already exists', 400);
    }

    const user = new User({
      username,
      email,
      password,
      location,
      bio
    });

    await user.save();

    const token = generateToken({ userId: user._id });

    successResponse(res, {
      user: user.toJSON(),
      token
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Registration failed', 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return validationErrorResponse(res, {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken({ userId: user._id });

    successResponse(res, {
      user: user.toJSON(),
      token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Login failed', 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('problemsSolved');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, location, bio } = req.body;
    const userId = req.user._id;

    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return errorResponse(res, 'Username is already taken', 400);
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to update profile', 500);
  }
};