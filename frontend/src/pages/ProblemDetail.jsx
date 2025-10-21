import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { problemService } from '../services/problemService';
import toast from 'react-hot-toast';
import {
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ChevronLeftIcon,
  PhotoIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemService.getProblemById(id);
      setProblem(response.data.problem);
    } catch (error) {
      toast.error('Failed to fetch problem details');
      navigate('/problems');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote');
      return;
    }

    try {
      const response = await problemService.upvoteProblem(id);
      setProblem(prev => ({
        ...prev,
        upvoteCount: response.data.upvoteCount,
        hasUpvoted: response.data.hasUpvoted
      }));
      toast.success(response.data.hasUpvoted ? 'Problem upvoted!' : 'Upvote removed');
    } catch (error) {
      toast.error('Failed to upvote problem');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      Solved: 'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Problem not found</h3>
        <p className="text-gray-500 mt-2">The problem you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/problems')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back to Problems
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/problems')}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4 mr-1" />
        Back to Problems
      </button>

      {/* Problem Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(problem.priority)}`}>
                  {problem.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(problem.status)}`}>
                  {problem.status}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {problem.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{problem.description}</p>
            </div>

            {/* Upvote Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleUpvote}
                className={`p-3 rounded-full transition-colors ${
                  problem.hasUpvoted
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                } ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={!isAuthenticated}
              >
                {problem.hasUpvoted ? (
                  <HeartIconSolid className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
              <span className="text-sm font-medium text-gray-900 mt-1">
                {problem.upvoteCount}
              </span>
            </div>
          </div>
        </div>

        {/* Images */}
        {problem.images && problem.images.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PhotoIcon className="w-5 h-5 mr-2" />
              Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problem.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${image}`}
                    alt={`Problem image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {problem.location && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Location
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{problem.location.address}</p>
              {problem.location.coordinates && (
                <p className="text-sm text-gray-500 mt-1">
                  Coordinates: {problem.location.coordinates[1].toFixed(6)}, {problem.location.coordinates[0].toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>Posted by {problem.author.name}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>{problem.views} views</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {problem.solutionCount} solutions
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Solutions ({problem.solutionCount})
          </h2>
          {isAuthenticated && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Solution
            </button>
          )}
        </div>

        {problem.solutionCount === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No solutions yet</h3>
            <p className="text-gray-500">Be the first to help solve this problem!</p>
            {isAuthenticated && (
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                Add First Solution
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Solution cards will be rendered here */}
            <p className="text-gray-500">Solutions will be displayed here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;