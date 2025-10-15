'use client';

import { BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Mobile VAS Platform
            </h1>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
              Live
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>
            
            {/* Settings */}
            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">Settings</span>
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-700">Admin User</div>
                <div className="text-xs text-gray-500">admin@vasplatform.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
