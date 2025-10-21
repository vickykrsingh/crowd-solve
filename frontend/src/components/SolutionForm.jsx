import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SolutionForm = ({ problemId, onSolutionAdded, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to post a solution');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a solution description');
      return;
    }

    if (description.trim().length < 10) {
      toast.error('Solution description must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const solutionData = {
        problemId,
        description: description.trim()
      };

      // Import solutionService dynamically to avoid circular imports
      const { solutionService } = await import('../services/solutionService');
      const response = await solutionService.createSolution(solutionData);
      
      if (response.success && response.data) {
        toast.success('Solution posted successfully!');
        setDescription('');
        if (onSolutionAdded) {
          onSolutionAdded(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to post solution');
      }
    } catch (error) {
      console.error('Solution creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to post solution';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    if (onCancel) {
      onCancel();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">Login Required</h3>
        <p className="text-sm text-gray-600">
          You need to be logged in to post a solution.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Post a Solution</h4>
          <p className="text-sm text-gray-500">Share your solution to help solve this problem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="solution-description" className="sr-only">
            Solution Description
          </label>
          <textarea
            id="solution-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your solution in detail. What steps should be taken to solve this problem? What resources or approaches would work best?"
            rows={6}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            disabled={loading}
          />
          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Minimum 10 characters
            </p>
            <p className="text-xs text-gray-500">
              {description.length} characters
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !description.trim() || description.trim().length < 10}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Post Solution
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolutionForm;