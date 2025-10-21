import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solutionService } from '../services/solutionService';
import SolutionCard from '../components/SolutionCard';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const SolutionsPage = () => {
  const { isAuthenticated } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt'
  });

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'upvotes', label: 'Most Upvoted' },
  ];

  useEffect(() => {
    fetchSolutions();
  }, [filters]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      // Note: This would need a new endpoint for all solutions
      // For now, this is a placeholder structure
      setSolutions([]);
    } catch (error) {
      toast.error('Failed to fetch solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (solutionId) => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote');
      return;
    }

    try {
      const response = await solutionService.upvoteSolution(solutionId);
      
      setSolutions(prev => prev.map(solution => 
        solution._id === solutionId 
          ? { ...solution, upvoteCount: response.data.upvoteCount, hasUpvoted: response.data.hasUpvoted }
          : solution
      ));
      
      toast.success(response.data.hasUpvoted ? 'Solution upvoted!' : 'Upvote removed');
    } catch (error) {
      toast.error('Failed to upvote solution');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Solutions</h1>
          <p className="text-gray-600 mt-1">Browse solutions from the community</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search solutions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block px-3 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No solutions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Solutions will appear here as people contribute to problems.
            </p>
            <div className="mt-6">
              <Link
                to="/problems"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Problems
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution._id}
              solution={solution}
              onUpvote={handleUpvote}
              hasUpvoted={solution.hasUpvoted}
              isAccepted={solution.isAccepted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SolutionsPage;