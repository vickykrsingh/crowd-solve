import express from 'express';
import { 
  createProblem, 
  getProblems, 
  getProblemById, 
  updateProblem, 
  deleteProblem,
  upvoteProblem 
} from '../controllers/problemController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple } from '../lib/upload.js';

const router = express.Router();

router.post('/', authenticateToken, uploadMultiple, createProblem);
router.get('/', optionalAuth, getProblems);
router.get('/:id', optionalAuth, getProblemById);
router.put('/:id', authenticateToken, updateProblem);
router.delete('/:id', authenticateToken, deleteProblem);
router.post('/:id/upvote', authenticateToken, upvoteProblem);

export default router;