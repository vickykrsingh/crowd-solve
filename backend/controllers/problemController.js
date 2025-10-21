import Problem from '../models/Problem.js';
import Solution from '../models/Solution.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';

export const createProblem = async (req, res) => {
  try {
    const { title, description, location, category, priority } = req.body;
    const userId = req.user._id;

    console.log('Create problem request:', { title, description, location, category, priority, files: req.files?.length });

    if (!title || !description || !category) {
      return validationErrorResponse(res, {
        title: !title ? 'Title is required' : null,
        description: !description ? 'Description is required' : null,
        category: !category ? 'Category is required' : null
      });
    }

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file, 'crowd-solve/problems');
          images.push({
            url: uploadResult.url,
            publicId: uploadResult.publicId
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with other images even if one fails
        }
      }
    }

    // Parse location if provided
    let locationData = null;
    if (location) {
      try {
        locationData = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (parseError) {
        console.error('Location parse error:', parseError);
        locationData = { address: location }; // Fallback to address only
      }
    }

    const problem = new Problem({
      title,
      description,
      location: locationData,
      category,
      priority: priority || 'Medium',
      author: userId,
      images
    });

    await problem.save();
    await problem.populate('author', 'username avatar');

    console.log('Problem created successfully:', problem._id);
    successResponse(res, problem, 'Problem created successfully', 201);
  } catch (error) {
    console.error('Create problem error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to create problem', 500);
  }
};

export const getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, status, priority, search, location } = req.query;
    
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(filter)
      .populate('author', 'username avatar reputation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Problem.countDocuments(filter);

    successResponse(res, {
      problems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProblems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }, 'Problems retrieved successfully');
  } catch (error) {
    console.error('Get problems error:', error);
    errorResponse(res, 'Failed to retrieve problems', 500);
  }
};

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username avatar reputation location')
      .populate({
        path: 'solutions',
        populate: {
          path: 'author',
          select: 'username avatar reputation'
        }
      });

    if (!problem) {
      return errorResponse(res, 'Problem not found', 404);
    }

    // Emit real-time view count update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`problem-${id}`).emit('view-count-updated', {
        problemId: id,
        views: problem.views
      });
    }

    successResponse(res, problem, 'Problem retrieved successfully');
  } catch (error) {
    console.error('Get problem error:', error);
    errorResponse(res, 'Failed to retrieve problem', 500);
  }
};

export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, status } = req.body;
    const userId = req.user._id;

    const problem = await Problem.findById(id);

    if (!problem || !problem.isActive) {
      return errorResponse(res, 'Problem not found', 404);
    }

    if (problem.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Not authorized to update this problem', 403);
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar reputation');

    successResponse(res, updatedProblem, 'Problem updated successfully');
  } catch (error) {
    console.error('Update problem error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return validationErrorResponse(res, errors);
    }

    errorResponse(res, 'Failed to update problem', 500);
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const problem = await Problem.findById(id);

    if (!problem) {
      return errorResponse(res, 'Problem not found', 404);
    }

    if (problem.author.toString() !== userId.toString()) {
      return errorResponse(res, 'Not authorized to delete this problem', 403);
    }

    await Problem.findByIdAndUpdate(id, { isActive: false });
    await Solution.updateMany({ problem: id }, { isActive: false });

    successResponse(res, null, 'Problem deleted successfully');
  } catch (error) {
    console.error('Delete problem error:', error);
    errorResponse(res, 'Failed to delete problem', 500);
  }
};

export const upvoteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const problem = await Problem.findById(id);

    if (!problem || !problem.isActive) {
      return errorResponse(res, 'Problem not found', 404);
    }

    const existingUpvote = problem.upvotes.find(
      upvote => upvote.user.toString() === userId.toString()
    );

    if (existingUpvote) {
      problem.upvotes = problem.upvotes.filter(
        upvote => upvote.user.toString() !== userId.toString()
      );
    } else {
      problem.upvotes.push({ user: userId });
    }

    await problem.save();

    const io = req.app.get('socketio');
    io.to(`problem-${id}`).emit('upvote-updated', {
      problemId: id,
      upvoteCount: problem.upvoteCount,
      hasUpvoted: !existingUpvote
    });

    successResponse(res, {
      upvoteCount: problem.upvoteCount,
      hasUpvoted: !existingUpvote
    }, existingUpvote ? 'Upvote removed' : 'Problem upvoted');
  } catch (error) {
    console.error('Upvote problem error:', error);
    errorResponse(res, 'Failed to upvote problem', 500);
  }
};