import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserProblems,
  getUserSolutions,
  getUserComments,
  getUserLeaderboard
} from '../controllers/userController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user profile (public, but shows more info if accessing own profile)
router.get('/:userId', optionalAuth, getUserProfile);

// Update user profile (private)
router.put('/profile', authenticateToken, updateUserProfile);

// Get user's problems
router.get('/:userId/problems', getUserProblems);

// Get user's solutions
router.get('/:userId/solutions', getUserSolutions);

// Get user's comments
router.get('/:userId/comments', getUserComments);

// Get user leaderboard
router.get('/', getUserLeaderboard);

export default router;