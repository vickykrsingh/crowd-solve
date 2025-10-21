import express from 'express';
import Solution from '../models/Solution.js';
import Comment from '../models/Comment.js';
import { authenticateToken } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.post('/solution/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const solution = await Solution.findById(id);

    if (!solution || !solution.isActive) {
      return errorResponse(res, 'Solution not found', 404);
    }

    const existingUpvote = solution.upvotes.find(
      upvote => upvote.user.toString() === userId.toString()
    );

    if (existingUpvote) {
      solution.upvotes = solution.upvotes.filter(
        upvote => upvote.user.toString() !== userId.toString()
      );
    } else {
      solution.upvotes.push({ user: userId });
    }

    await solution.save();

    const io = req.app.get('socketio');
    io.to(`problem-${solution.problem}`).emit('solution-upvote-updated', {
      solutionId: id,
      upvoteCount: solution.upvoteCount,
      hasUpvoted: !existingUpvote,
      problemId: solution.problem
    });

    successResponse(res, {
      upvoteCount: solution.upvoteCount,
      hasUpvoted: !existingUpvote
    }, existingUpvote ? 'Upvote removed' : 'Solution upvoted');
  } catch (error) {
    console.error('Upvote solution error:', error);
    errorResponse(res, 'Failed to upvote solution', 500);
  }
});

router.post('/comment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment || !comment.isActive) {
      return errorResponse(res, 'Comment not found', 404);
    }

    const existingUpvote = comment.upvotes.find(
      upvote => upvote.user.toString() === userId.toString()
    );

    if (existingUpvote) {
      comment.upvotes = comment.upvotes.filter(
        upvote => upvote.user.toString() !== userId.toString()
      );
    } else {
      comment.upvotes.push({ user: userId });
    }

    await comment.save();

    const io = req.app.get('socketio');
    io.to(`problem-${comment.problem}`).emit('comment-upvote-updated', {
      commentId: id,
      upvoteCount: comment.upvoteCount,
      hasUpvoted: !existingUpvote,
      solutionId: comment.solution,
      problemId: comment.problem
    });

    successResponse(res, {
      upvoteCount: comment.upvoteCount,
      hasUpvoted: !existingUpvote
    }, existingUpvote ? 'Upvote removed' : 'Comment upvoted');
  } catch (error) {
    console.error('Upvote comment error:', error);
    errorResponse(res, 'Failed to upvote comment', 500);
  }
});

export default router;