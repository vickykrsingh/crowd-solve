import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChatBubbleLeftIcon, 
  HandThumbUpIcon 
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

const CommentCard = ({ comment, showContext = false }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {comment.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">{comment.author.username}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
          
          {showContext && comment.problem && (
            <div className="text-xs text-blue-600 mb-2">
              on problem: {comment.problem.title}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <HandThumbUpIcon className="w-4 h-4" />
              <span>{comment.upvoteCount || 0}</span>
            </div>
            
            {comment.replies && comment.replies.length > 0 && (
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{comment.replies.length} replies</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;