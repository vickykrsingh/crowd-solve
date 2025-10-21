import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getImageUrl } from '../utils/imageUtils';

const ProblemCard = ({ problem, onUpvote, hasUpvoted = false }) => {
  const {
    _id,
    title,
    description,
    location,
    category,
    priority,
    status,
    author,
    images,
    upvoteCount,
    solutionCount,
    views,
    createdAt
  } = problem;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800'; // Open
    }
  };

  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUpvote) {
      onUpvote(_id);
    }
  };

  return (
    <Link to={`/problems/${_id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
              {priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Image preview */}
        {images && images.length > 0 && (
          <div className="mb-4">
            <img
              src={getImageUrl(images[0].url)}
              alt="Problem"
              className="w-full h-32 object-cover rounded-lg"
              onLoad={() => console.log('ProblemCard image loaded:', getImageUrl(images[0].url))}
              onError={() => console.log('ProblemCard image failed:', getImageUrl(images[0].url))}
            />
            {images.length > 1 && (
              <div className="mt-2 text-xs text-gray-500">
                +{images.length - 1} more image{images.length > 2 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {location?.address || 'Location not specified'}
        </div>

        {/* Author and date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm text-gray-600">{author?.username}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            {formatDate(createdAt)}
          </div>
        </div>

        {/* Stats and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="w-4 h-4 mr-1" />
              {views || 0}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
              {solutionCount || 0} solution{solutionCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Upvote button */}
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              hasUpvoted
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {hasUpvoted ? (
              <HeartSolidIcon className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{upvoteCount || 0}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;