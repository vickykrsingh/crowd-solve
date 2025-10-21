import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      name: 'Report Problems',
      description: 'Easily report community issues with photos and location details.',
      icon: ExclamationTriangleIcon,
    },
    {
      name: 'Collaborative Solutions',
      description: 'Community members can suggest and discuss solutions together.',
      icon: LightBulbIcon,
    },
    {
      name: 'Real-time Updates',
      description: 'Get instant notifications on comments and solution updates.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Community Driven',
      description: 'Vote on the best solutions and help prioritize community needs.',
      icon: UserGroupIcon,
    },
  ];

  const stats = [
    { label: 'Problems Reported', value: '1,200+' },
    { label: 'Solutions Provided', value: '3,400+' },
    { label: 'Active Users', value: '850+' },
    { label: 'Problems Solved', value: '680+' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Community Problem Solving
          <span className="text-indigo-600"> Made Simple</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          Report community issues, collaborate on solutions, and make your neighborhood better. 
          Join thousands of community members working together to solve local problems.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/problems"
                className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Browse Problems
              </Link>
              <Link
                to="/post-problem"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
              >
                Report a Problem <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/problems"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
              >
                Browse Problems <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 rounded-2xl shadow-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl py-16">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Community Solutions</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to solve community problems
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform provides all the tools needed for effective community problem-solving, 
            from reporting issues to implementing solutions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                <feature.icon className="h-6 w-6 flex-none text-indigo-600" aria-hidden="true" />
                {feature.name}
              </dt>
              <dd className="text-base leading-7 text-gray-600">
                {feature.description}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-indigo-600 rounded-2xl">
          <div className="px-6 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to make a difference?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
                Join our community today and start contributing to solutions that matter.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Link
                  to="/register"
                  className="w-full sm:w-auto rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
                >
                  Join Now
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-semibold leading-6 text-white hover:text-indigo-200 transition-colors"
                >
                  Already have an account? <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;