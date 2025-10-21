import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    type: {
      address: String,
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    required: [true, 'Location is required']
  },
  images: [{
    url: String,
    publicId: String
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Infrastructure', 'Environment', 'Safety', 'Community', 'Transportation', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Solved', 'Closed'],
    default: 'Open'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  solutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  }],
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

problemSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

problemSchema.virtual('solutionCount').get(function() {
  return this.solutions ? this.solutions.length : 0;
});

problemSchema.set('toJSON', { virtuals: true });
problemSchema.set('toObject', { virtuals: true });

export default mongoose.model('Problem', problemSchema);