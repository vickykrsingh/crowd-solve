import express from 'express';
import { 
  createComment, 
  getCommentsBySolution, 
  updateComment, 
  deleteComment, 
  upvoteComment 
} from '../controllers/commentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create a new comment
router.post('/', auth, createComment);

// Get comments for a specific solution
router.get('/solution/:solutionId', getCommentsBySolution);

// Update a comment
router.put('/:id', auth, updateComment);

// Delete a comment
router.delete('/:id', auth, deleteComment);

// Upvote/downvote a comment
router.post('/:id/upvote', auth, upvoteComment);

export default router;