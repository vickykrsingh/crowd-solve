import React from 'react';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const SolutionCard = ({ solution, onUpvote, hasUpvoted = false, isAccepted = false, onAccept, canAccept = false }) => {
  const {
    _id,
    description,
    author,
    upvoteCount = 0,
    commentCount = 0,
    createdAt,
    updatedAt
  } = solution;

  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onUpvote(_id);
  };

  const handleAccept = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAccept) {
      onAccept(_id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-md ${
      isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {author?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{author?.name || 'Anonymous'}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span>{formatDate(createdAt)}</span>
              {updatedAt && updatedAt !== createdAt && (
                <span className="text-gray-400">• edited</span>
              )}
            </div>
          </div>
        </div>

        {/* Accept Solution Button */}
        {canAccept && !isAccepted && (
          <button
            onClick={handleAccept}
            className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Accept Solution
          </button>
        )}

        {/* Accepted Badge */}
        {isAccepted && (
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-green-800 bg-green-100">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Accepted Solution
          </div>
        )}
      </div>

      {/* Solution Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              hasUpvoted
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {hasUpvoted ? (
              <HeartSolidIcon className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{upvoteCount}</span>
          </button>

          {/* Comments Count */}
          <div className="inline-flex items-center space-x-1 text-sm text-gray-500">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{commentCount} comments</span>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center space-x-2">
          {author && (
            <div className="text-xs text-gray-400">
              by {author.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionCard;