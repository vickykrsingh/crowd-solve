import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

const Header = ({ setSidebarOpen }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            {/* Search bar */}
            <div className="hidden sm:block">
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* User menu */}
                <Link 
                  to="/profile"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;