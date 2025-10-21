import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'new_solution',      // Someone posted a solution to your problem
      'new_comment',       // Someone commented on your solution
      'solution_upvoted',  // Someone upvoted your solution
      'comment_upvoted',   // Someone upvoted your comment
      'comment_reply',     // Someone replied to your comment
      'problem_upvoted',   // Someone upvoted your problem
      'solution_accepted', // Your solution was accepted/marked as best
      'mention',           // Someone mentioned you in a comment
      'follow'             // Someone followed you (if implementing follow system)
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Solution'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    url: String // Direct link to the relevant content
  },
  isRead: {
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

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMs = now - this.createdAt;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);