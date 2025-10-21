import express from 'express';
import { 
  createSolution, 
  getSolutionsByProblem, 
  updateSolution, 
  deleteSolution,
  upvoteSolution,
  acceptSolution
} from '../controllers/solutionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadMultiple } from '../utils/upload.js';

const router = express.Router();

router.post('/', authenticateToken, uploadMultiple, createSolution);
router.get('/problem/:problemId', getSolutionsByProblem);
router.put('/:id', authenticateToken, updateSolution);
router.delete('/:id', authenticateToken, deleteSolution);
router.post('/:id/upvote', authenticateToken, upvoteSolution);
router.post('/:id/accept', authenticateToken, acceptSolution);

export default router;