'use client';

import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UsersIcon, 
  ChartBarIcon,
  HeartIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: HomeIcon },
  { name: 'Quotes Manager', id: 'quotes', icon: HeartIcon },
  { name: 'Users', id: 'users', icon: UsersIcon },
  { name: 'Messages', id: 'messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', id: 'analytics', icon: ChartBarIcon },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              VAS Platform
            </span>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.id)}
                  className={`${
                    activeTab === item.id
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200`}
                >
                  <Icon
                    className={`${
                      activeTab === item.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Admin User
                </div>
                <div className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  admin@vasplatform.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
