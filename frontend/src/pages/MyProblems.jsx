import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { problemService } from '../services/problemService';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const MyProblems = () => {
  const { user, isAuthenticated } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, solved, unsolved

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyProblems();
    }
  }, [user, isAuthenticated]);

  const fetchMyProblems = async () => {
    try {
      setLoading(true);
      const response = await problemService.getUserProblems(user._id || user.id);
      console.log('MyProblems API response:', response);
      if (response.success && response.data) {
        const problemsData = Array.isArray(response.data.problems) ? response.data.problems : [];
        console.log('Problems data:', problemsData);
        setProblems(problemsData);
      } else {
        setProblems([]);
      }
    } catch (error) {
      console.error('Error fetching user problems:', error);
      setProblems([]);
      toast.error('Failed to load your problems');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      await problemService.deleteProblem(problemId);
      setProblems(problems.filter(p => p._id !== problemId));
      toast.success('Problem deleted successfully');
    } catch (error) {
      console.error('Error deleting problem:', error);
      toast.error('Failed to delete problem');
    }
  };

  const filteredProblems = Array.isArray(problems) ? problems.filter(problem => {
    if (filter === 'solved') return problem.solutionCount > 0;
    if (filter === 'unsolved') return problem.solutionCount === 0;
    return true;
  }) : [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view your problems.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Problems</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your posted problems
          </p>
        </div>
        <Link
          to="/post-problem"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Post New Problem
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Problems', count: Array.isArray(problems) ? problems.length : 0 },
              { key: 'unsolved', label: 'Unsolved', count: Array.isArray(problems) ? problems.filter(p => p.solutionCount === 0).length : 0 },
              { key: 'solved', label: 'Solved', count: Array.isArray(problems) ? problems.filter(p => p.solutionCount > 0).length : 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TagIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No problems posted yet' : `No ${filter} problems`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Start by posting your first problem to get help from the community.'
              : `You don't have any ${filter} problems at the moment.`
            }
          </p>
          {filter === 'all' && (
            <Link
              to="/post-problem"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Post Your First Problem
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProblems.map((problem) => (
            <div key={problem._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    to={`/problems/${problem._id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {problem.title}
                  </Link>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {problem.description}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Link
                    to={`/problems/${problem._id}`}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteProblem(problem._id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete Problem"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Problem Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {problem.viewCount || 0} views
                  </div>
                  <div className="flex items-center">
                    <HeartIcon className="h-4 w-4 mr-1" />
                    {problem.upvoteCount || 0} upvotes
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    {problem.solutionCount || 0} solutions
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(problem.createdAt)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {problem.tags && problem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    problem.solutionCount > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {problem.solutionCount > 0 ? 'Solved' : 'Unsolved'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProblems;