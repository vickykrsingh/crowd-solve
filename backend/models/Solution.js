import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Solution content is required'],
    maxlength: [2000, 'Solution cannot exceed 2000 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

solutionSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

solutionSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

solutionSchema.set('toJSON', { virtuals: true });
solutionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Solution', solutionSchema);