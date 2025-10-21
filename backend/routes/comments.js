import express from 'express';
import { 
  createComment, 
  getCommentsBySolution, 
  updateComment, 
  deleteComment,
  upvoteComment
} from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createComment);
router.get('/solution/:solutionId', getCommentsBySolution);
router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);
router.post('/:id/upvote', authenticateToken, upvoteComment);

export default router;