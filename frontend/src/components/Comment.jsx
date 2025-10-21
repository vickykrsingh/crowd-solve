import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentService } from '../services/commentService';
import toast from 'react-hot-toast';
import {
  HeartIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Comment = ({ comment, onUpdate, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(comment.isUpvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount || 0);

  const isOwner = user && (user._id === comment.author._id || user.id === comment.author._id);

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment content cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await commentService.updateComment(comment._id, {
        content: editContent.trim()
      });

      if (response.success) {
        onUpdate(response.data);
        setIsEditing(false);
        toast.success('Comment updated successfully');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.deleteComment(comment._id);
      onDelete(comment._id);
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to upvote');
      return;
    }

    try {
      const response = await commentService.upvoteComment(comment._id);
      if (response.success) {
        setIsUpvoted(response.data.isUpvoted);
        setUpvoteCount(response.data.upvoteCount);
      }
    } catch (error) {
      console.error('Error upvoting comment:', error);
      toast.error('Failed to upvote comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserIcon className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{comment.author.username}</p>
            <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
          </div>
        </div>

        {/* Action buttons */}
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit comment"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              title="Delete comment"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Comment content */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            placeholder="Write your comment..."
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isSubmitting}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
      )}

      {/* Upvote button */}
      <div className="flex items-center">
        <button
          onClick={handleUpvote}
          disabled={!isAuthenticated}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
            isUpvoted
              ? 'text-red-600 bg-red-50'
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUpvoted ? (
            <HeartIconSolid className="h-4 w-4" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
          <span>{upvoteCount}</span>
        </button>
      </div>
    </div>
  );
};

export default Comment;