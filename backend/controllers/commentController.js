import Comment from '../models/Comment.js';
import Solution from '../models/Solution.js';
import Problem from '../models/Problem.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';

export const createComment = async (req, res) => {
  try {
    const { content, solutionId, parentCommentId } = req.body;
    const userId = req.user._id;

    if (!content || !solutionId) {
      return validationErrorResponse(res, {
        content: !content ? 'Comment content is required' : null,
        solutionId: !solutionId ? 'Solution ID is required' : null
      });
    }

    const solution = await Solution.findById(solutionId);
    if (!solution || !solution.isActive) {
      return errorResponse(res, 'Solution not found', 404);
    }

    const comment = new Comment({
      content,
      author: userId,
      solution: solutionId,
      problem: solution.problem,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    solution.comments.push(comment._id);
    await solution.save();

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    const io = req.app.get('socketio');
    io.to(`problem-${solution.problem}`).emit('new-comment', {
      comment,
      solutionId,
      problemId: solution.problem
    });

    successResponse(res, comment, 'Comment created successfully', 201);
  } catch (error) {
    console.error('Create comment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to create comment', 500);
  }
};

export const getCommentsBySolution = async (req, res) => {
  try {
    const { solutionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const solution = await Solution.findById(solutionId);
    if (!solution || !solution.isActive) {
      return errorResponse(res, 'Solution not found', 404);
    }

    const comments = await Comment.find({ 
      solution: solutionId, 
      isActive: true,
      parentComment: null
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ 
      solution: solutionId, 
      isActive: true,
      parentComment: null
    });

    successResponse(res, {
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }, 'Comments retrieved successfully');
  } catch (error) {
    console.error('Get comments error:', error);
    errorResponse(res, 'Failed to retrieve comments', 500);
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment || !comment.isActive) {
      return errorResponse(res, 'Comment not found', 404);
    }

    if (comment.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Not authorized to update this comment', 403);
    }

    comment.content = content || comment.content;
    await comment.save();

    await comment.populate('author', 'username avatar');

    const io = req.app.get('socketio');
    io.to(`problem-${comment.problem}`).emit('comment-updated', {
      comment,
      solutionId: comment.solution,
      problemId: comment.problem
    });

    successResponse(res, comment, 'Comment updated successfully');
  } catch (error) {
    console.error('Update comment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to update comment', 500);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    if (comment.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Not authorized to delete this comment', 403);
    }

    await Comment.findByIdAndUpdate(id, { isActive: false });

    await Solution.findByIdAndUpdate(comment.solution, {
      $pull: { comments: id }
    });

    const io = req.app.get('socketio');
    io.to(`problem-${comment.problem}`).emit('comment-deleted', {
      commentId: id,
      solutionId: comment.solution,
      problemId: comment.problem
    });

    successResponse(res, null, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    errorResponse(res, 'Failed to delete comment', 500);
  }
};

export const upvoteComment = async (req, res) => {
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
};