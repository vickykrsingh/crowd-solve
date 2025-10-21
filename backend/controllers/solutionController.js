import Solution from '../models/Solution.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';

export const createSolution = async (req, res) => {
  try {
    const { content, problemId } = req.body;
    const userId = req.user._id;

    if (!content || !problemId) {
      return validationErrorResponse(res, {
        content: !content ? 'Solution content is required' : null,
        problemId: !problemId ? 'Problem ID is required' : null
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem || !problem.isActive) {
      return errorResponse(res, 'Problem not found', 404);
    }

    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      publicId: file.filename
    })) : [];

    const solution = new Solution({
      content,
      problem: problemId,
      author: userId,
      images
    });

    await solution.save();

    problem.solutions.push(solution._id);
    await problem.save();

    await solution.populate('author', 'username avatar reputation');

    const io = req.app.get('socketio');
    io.to(`problem-${problemId}`).emit('new-solution', {
      solution,
      problemId
    });

    successResponse(res, solution, 'Solution created successfully', 201);
  } catch (error) {
    console.error('Create solution error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to create solution', 500);
  }
};

export const getSolutionsByProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const problem = await Problem.findById(problemId);
    if (!problem || !problem.isActive) {
      return errorResponse(res, 'Problem not found', 404);
    }

    const solutions = await Solution.find({ 
      problem: problemId, 
      isActive: true 
    })
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .sort({ isAccepted: -1, upvotes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Solution.countDocuments({ 
      problem: problemId, 
      isActive: true 
    });

    successResponse(res, {
      solutions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSolutions: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }, 'Solutions retrieved successfully');
  } catch (error) {
    console.error('Get solutions error:', error);
    errorResponse(res, 'Failed to retrieve solutions', 500);
  }
};

export const updateSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const solution = await Solution.findById(id);

    if (!solution || !solution.isActive) {
      return errorResponse(res, 'Solution not found', 404);
    }

    if (solution.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Not authorized to update this solution', 403);
    }

    solution.content = content || solution.content;
    await solution.save();

    await solution.populate('author', 'username avatar reputation');

    const io = req.app.get('socketio');
    io.to(`problem-${solution.problem}`).emit('solution-updated', {
      solution,
      problemId: solution.problem
    });

    successResponse(res, solution, 'Solution updated successfully');
  } catch (error) {
    console.error('Update solution error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to update solution', 500);
  }
};

export const deleteSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const solution = await Solution.findById(id);

    if (!solution) {
      return errorResponse(res, 'Solution not found', 404);
    }

    if (solution.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Not authorized to delete this solution', 403);
    }

    await Solution.findByIdAndUpdate(id, { isActive: false });

    await Problem.findByIdAndUpdate(solution.problem, {
      $pull: { solutions: id }
    });

    const io = req.app.get('socketio');
    io.to(`problem-${solution.problem}`).emit('solution-deleted', {
      solutionId: id,
      problemId: solution.problem
    });

    successResponse(res, null, 'Solution deleted successfully');
  } catch (error) {
    console.error('Delete solution error:', error);
    errorResponse(res, 'Failed to delete solution', 500);
  }
};

export const upvoteSolution = async (req, res) => {
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
};

export const acceptSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const solution = await Solution.findById(id);
    if (!solution || !solution.isActive) {
      return errorResponse(res, 'Solution not found', 404);
    }

    const problem = await Problem.findById(solution.problem);
    if (!problem || problem.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Only problem author can accept solutions', 403);
    }

    await Solution.updateMany(
      { problem: solution.problem },
      { isAccepted: false }
    );

    solution.isAccepted = true;
    await solution.save();

    problem.status = 'Solved';
    await problem.save();

    await User.findByIdAndUpdate(solution.author, {
      $inc: { reputation: 10, problemsSolved: 1 }
    });

    const io = req.app.get('socketio');
    io.to(`problem-${solution.problem}`).emit('solution-accepted', {
      solutionId: id,
      problemId: solution.problem
    });

    successResponse(res, solution, 'Solution accepted successfully');
  } catch (error) {
    console.error('Accept solution error:', error);
    errorResponse(res, 'Failed to accept solution', 500);
  }
};