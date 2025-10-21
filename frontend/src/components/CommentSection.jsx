import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentService } from '../services/commentService';
import Comment from './Comment';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const CommentSection = ({ solutionId, title = 'Comments' }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (solutionId) {
      fetchComments();
    }
  }, [solutionId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getComments(solutionId);
      if (response.success && response.data) {
        const commentsData = Array.isArray(response.data.comments) ? response.data.comments : [];
        setComments(commentsData);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      // Don't show error toast for comments as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to add a comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment content cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await commentService.createComment({
        content: newComment.trim(),
        solutionId
      });

      if (response.success) {
        setComments([response.data, ...comments]);
        setNewComment('');
        setShowCommentForm(false);
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = (updatedComment) => {
    setComments(comments.map(comment => 
      comment._id === updatedComment._id ? updatedComment : comment
    ));
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(comment => comment._id !== commentId));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="h-6 w-6 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-900">
            {title} ({comments.length})
          </h3>
        </div>
        
        {isAuthenticated && !showCommentForm && (
          <button
            onClick={() => setShowCommentForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Comment</span>
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="Write your comment..."
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No comments yet</p>
          {!isAuthenticated ? (
            <p className="text-sm text-gray-400">
              Please log in to add the first comment
            </p>
          ) : !showCommentForm ? (
            <button
              onClick={() => setShowCommentForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Be the first to comment
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(comments) && comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;