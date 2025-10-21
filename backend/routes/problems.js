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

// Debug middleware
const debugMulterMiddleware = (req, res, next) => {
  console.log('=== MULTER DEBUG ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body before multer:', Object.keys(req.body || {}));
  console.log('Files before multer:', req.files?.length || 0);
  next();
};

// Debug middleware after multer
const debugAfterMulter = (req, res, next) => {
  console.log('=== AFTER MULTER DEBUG ===');
  console.log('Body after multer:', req.body);
  console.log('Files after multer:', req.files?.length || 0);
  if (req.files) {
    req.files.forEach((file, index) => {
      console.log(`File ${index}:`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer
      });
    });
  }
  next();
};

router.post('/', authenticateToken, debugMulterMiddleware, uploadMultiple, debugAfterMulter, createProblem);
router.get('/', optionalAuth, getProblems);
router.get('/:id', optionalAuth, getProblemById);
router.put('/:id', authenticateToken, updateProblem);
router.delete('/:id', authenticateToken, deleteProblem);
router.post('/:id/upvote', authenticateToken, upvoteProblem);

export default router;