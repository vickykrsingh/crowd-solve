import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  LightBulbIcon,
  TrophyIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { problemService } from '../services/problemService';
import { solutionService } from '../services/solutionService';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Tab data states
  const [userProblems, setUserProblems] = useState([]);
  const [userSolutions, setUserSolutions] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (isRequesting) {
      console.log('Request already in progress, skipping...');
      return;
    }

    try {
      setIsRequesting(true);
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('Fetching profile for userId:', userId);
      console.log('Current user:', currentUser);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await api.get(`/users/${userId}`);
      setProfile(response.data.data);
      console.log('Profile data loaded successfully:', response.data.data);
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setIsRequesting(false);
    }
  };

  const fetchUserProblems = async () => {
    try {
      setTabLoading(true);
      const response = await problemService.getUserProblems(userId);
      if (response.success && response.data) {
        setUserProblems(Array.isArray(response.data.problems) ? response.data.problems : []);
      }
    } catch (error) {
      console.error('Error fetching user problems:', error);
      setUserProblems([]);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchUserSolutions = async () => {
    try {
      setTabLoading(true);
      const response = await api.get(`/users/${userId}/solutions`);
      if (response.data.success && response.data.data) {
        setUserSolutions(Array.isArray(response.data.data.solutions) ? response.data.data.solutions : []);
      }
    } catch (error) {
      console.error('Error fetching user solutions:', error);
      setUserSolutions([]);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchUserComments = async () => {
    try {
      setTabLoading(true);
      const response = await api.get(`/users/${userId}/comments`);
      if (response.data.success && response.data.data) {
        setUserComments(Array.isArray(response.data.data.comments) ? response.data.data.comments : []);
      }
    } catch (error) {
      console.error('Error fetching user comments:', error);
      setUserComments([]);
    } finally {
      setTabLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'problems' && userProblems.length === 0) {
      fetchUserProblems();
    } else if (tabId === 'solutions' && userSolutions.length === 0) {
      fetchUserSolutions();
    } else if (tabId === 'comments' && userComments.length === 0) {
      fetchUserComments();
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;
  if (!profile || !profile.user || !profile.stats) return <div className="text-center p-8">Profile not found</div>;

  const { user, stats, recentActivity } = profile;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'problems', name: 'Problems', icon: DocumentTextIcon, count: stats?.problemsPosted || 0 },
    { id: 'solutions', name: 'Solutions', icon: LightBulbIcon, count: stats?.solutionsProvided || 0 },
    { id: 'comments', name: 'Comments', icon: ChatBubbleLeftIcon, count: stats?.commentsPosted || 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-600" />
                </div>
              )}
              {user.isVerified && (
                <CheckBadgeIcon className="absolute -top-1 -right-1 w-6 h-6 text-blue-500" />
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                {isOwnProfile && (
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {user.bio && (
                <p className="text-gray-600 mb-3 max-w-md">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrophyIcon className="w-4 h-4" />
                  <span>{user.reputation} reputation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.problemsPosted}</div>
            <div className="text-sm text-gray-500">Problems Posted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.solutionsProvided}</div>
            <div className="text-sm text-gray-500">Solutions Provided</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.acceptedSolutions}</div>
            <div className="text-sm text-gray-500">Accepted Solutions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalUpvotesReceived}</div>
            <div className="text-sm text-gray-500">Total Upvotes</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-900 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Additional Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-xl font-bold text-blue-900">{stats.problemUpvotes}</div>
                      <div className="text-sm text-blue-600">Problem Upvotes</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <LightBulbIcon className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-xl font-bold text-green-900">{stats.acceptanceRate}%</div>
                      <div className="text-sm text-green-600">Acceptance Rate</div>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ChatBubbleLeftIcon className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="text-xl font-bold text-purple-900">{stats.commentUpvotes}</div>
                      <div className="text-sm text-purple-600">Comment Upvotes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.problems.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Recent Problems</h4>
                    <div className="space-y-2">
                      {recentActivity.problems.slice(0, 3).map(problem => (
                        <div key={problem._id} className="p-4 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{problem.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{problem.category} • {problem.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {recentActivity.solutions.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Recent Solutions</h4>
                    <div className="space-y-2">
                      {recentActivity.solutions.slice(0, 3).map(solution => (
                        <div key={solution._id} className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">{solution.content.substring(0, 100)}...</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {solution.upvoteCount} upvotes • {solution.isAccepted ? 'Accepted' : 'Not accepted'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Problems Posted</h3>
            {tabLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : userProblems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No problems posted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userProblems.map((problem) => (
                  <div key={problem._id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      <a href={`/problems/${problem._id}`} className="hover:text-blue-600">
                        {problem.title}
                      </a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{problem.viewCount || 0} views</span>
                        <span>{problem.upvoteCount || 0} upvotes</span>
                        <span>{problem.solutionCount || 0} solutions</span>
                      </div>
                      <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'solutions' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Solutions Provided</h3>
            {tabLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : userSolutions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <LightBulbIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No solutions provided yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userSolutions.map((solution) => (
                  <div key={solution._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Solution to: <a href={`/problems/${solution.problem._id}`} className="hover:text-blue-600">
                          {solution.problem.title}
                        </a>
                      </h4>
                      {solution.isAccepted && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Accepted
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {solution.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{solution.upvoteCount || 0} upvotes</span>
                        <span>{solution.commentCount || 0} comments</span>
                      </div>
                      <span>{new Date(solution.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Comments Posted</h3>
            {tabLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : userComments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ChatBubbleLeftIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No comments posted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">
                        Comment on solution to: <a href={`/problems/${comment.problem._id}`} className="hover:text-blue-600 font-medium">
                          {comment.problem.title}
                        </a>
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {comment.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{comment.upvoteCount || 0} upvotes</span>
                      </div>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;