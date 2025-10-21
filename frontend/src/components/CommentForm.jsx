import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const CommentForm = ({ 
  solutionId, 
  problemId, 
  parentCommentId = null, 
  onCommentSubmit,
  placeholder = "Write a comment...",
  compact = false 
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim(),
          solutionId,
          problemId,
          ...(parentCommentId && { parentCommentId })
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post comment');
      }

      const data = await response.json();
      
      // Call parent callback with new comment
      if (onCommentSubmit) {
        onCommentSubmit(data.data);
      }
      
      // Clear form
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-2" : "space-y-3"}>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex space-x-3">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={compact ? 2 : 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={`${
            compact ? 'px-3 py-2' : 'px-4 py-2'
          } bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <PaperAirplaneIcon className="w-4 h-4" />
          )}
          {!compact && <span>{isSubmitting ? 'Posting...' : 'Post'}</span>}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;