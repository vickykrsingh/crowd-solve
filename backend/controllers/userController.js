import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Solution from '../models/Solution.js';
import Comment from '../models/Comment.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get user stats
    const [problems, solutions, comments] = await Promise.all([
      Problem.find({ author: userId, isActive: true }),
      Solution.find({ author: userId, isActive: true }),
      Comment.find({ author: userId, isActive: true })
    ]);

    // Calculate total upvotes received
    const totalProblemUpvotes = problems.reduce((total, problem) => total + problem.upvoteCount, 0);
    const totalSolutionUpvotes = solutions.reduce((total, solution) => total + solution.upvoteCount, 0);
    const totalCommentUpvotes = comments.reduce((total, comment) => comment.upvoteCount, 0);

    // Calculate acceptance rate
    const acceptedSolutions = solutions.filter(solution => solution.isAccepted).length;
    const acceptanceRate = solutions.length > 0 ? (acceptedSolutions / solutions.length * 100).toFixed(1) : 0;

    const profileData = {
      user: {
        _id: user._id,
        username: user.username,
        email: currentUserId?.toString() === userId ? user.email : undefined, // Only show email to self
        avatar: user.avatar,
        reputation: user.reputation,
        location: user.location,
        bio: user.bio,
        joinedAt: user.createdAt,
        isVerified: user.isVerified
      },
      stats: {
        problemsPosted: problems.length,
        solutionsProvided: solutions.length,
        commentsPosted: comments.length,
        acceptedSolutions,
        acceptanceRate: parseFloat(acceptanceRate),
        totalUpvotesReceived: totalProblemUpvotes + totalSolutionUpvotes + totalCommentUpvotes,
        problemUpvotes: totalProblemUpvotes,
        solutionUpvotes: totalSolutionUpvotes,
        commentUpvotes: totalCommentUpvotes
      },
      recentActivity: {
        problems: problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        solutions: solutions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        comments: comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      }
    };

    successResponse(res, profileData, 'User profile retrieved successfully');

  } catch (error) {
    console.error('Get user profile error:', error);
    errorResponse(res, 'Failed to retrieve user profile', 500);
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, location, avatar } = req.body;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return validationErrorResponse(res, {
          username: 'Username is already taken'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(username && { username }),
          ...(bio !== undefined && { bio }),
          ...(location && { location }),
          ...(avatar && { avatar })
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    successResponse(res, updatedUser, 'Profile updated successfully');

  } catch (error) {
    console.error('Update user profile error:', error);
    
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

// Get user's problems
export const getUserProblems = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // 'Open', 'In Progress', 'Solved', 'Closed'
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const filter = {
      author: userId,
      isActive: true
    };

    if (status) filter.status = status;
    if (category) filter.category = category;

    const problems = await Problem.find(filter)
      .populate('author', 'username avatar reputation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProblems = await Problem.countDocuments(filter);

    successResponse(res, {
      problems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProblems / limit),
        totalProblems,
        hasNext: page < Math.ceil(totalProblems / limit),
        hasPrev: page > 1
      }
    }, 'User problems retrieved successfully');

  } catch (error) {
    console.error('Get user problems error:', error);
    errorResponse(res, 'Failed to retrieve user problems', 500);
  }
};

// Get user's solutions
export const getUserSolutions = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const accepted = req.query.accepted === 'true' ? true : req.query.accepted === 'false' ? false : undefined;
    const skip = (page - 1) * limit;

    const filter = {
      author: userId,
      isActive: true
    };

    if (accepted !== undefined) filter.isAccepted = accepted;

    const solutions = await Solution.find(filter)
      .populate('author', 'username avatar reputation')
      .populate('problem', 'title status category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSolutions = await Solution.countDocuments(filter);

    successResponse(res, {
      solutions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSolutions / limit),
        totalSolutions,
        hasNext: page < Math.ceil(totalSolutions / limit),
        hasPrev: page > 1
      }
    }, 'User solutions retrieved successfully');

  } catch (error) {
    console.error('Get user solutions error:', error);
    errorResponse(res, 'Failed to retrieve user solutions', 500);
  }
};

// Get user's comments
export const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      author: userId,
      isActive: true
    })
      .populate('author', 'username avatar reputation')
      .populate('solution', 'content')
      .populate('problem', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({
      author: userId,
      isActive: true
    });

    successResponse(res, {
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNext: page < Math.ceil(totalComments / limit),
        hasPrev: page > 1
      }
    }, 'User comments retrieved successfully');

  } catch (error) {
    console.error('Get user comments error:', error);
    errorResponse(res, 'Failed to retrieve user comments', 500);
  }
};

// Get user leaderboard/ranking
export const getUserLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'reputation'; // reputation, solutions, problems

    let sortCriteria = {};
    switch (sortBy) {
      case 'solutions':
        // This would require aggregation to count solutions
        break;
      case 'problems':
        // This would require aggregation to count problems
        break;
      default:
        sortCriteria = { reputation: -1 };
    }

    const users = await User.find({ isActive: true })
      .select('username avatar reputation location createdAt')
      .sort(sortCriteria)
      .limit(limit);

    // Add ranking
    const rankedUsers = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    successResponse(res, rankedUsers, 'User leaderboard retrieved successfully');

  } catch (error) {
    console.error('Get user leaderboard error:', error);
    errorResponse(res, 'Failed to retrieve user leaderboard', 500);
  }
};