'use client';

import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalMessages: 0,
    totalRevenue: 0,
    loveSubscribers: 0,
    bibleSubscribers: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch recent messages
      const messagesResponse = await fetch('/api/admin/recent-messages');
      const messagesData = await messagesResponse.json();
      
      if (messagesData.success) {
        setRecentMessages(messagesData.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: HeartIcon,
      color: 'bg-pink-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Messages Sent',
      value: stats.totalMessages,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: `Ksh ${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      change: '+23%',
      changeType: 'positive'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your Mobile VAS Platform performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HeartIcon className="h-5 w-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Love Quotes</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.loveSubscribers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Bible Verses</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.bibleSubscribers}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Cron Jobs</span>
              </div>
              <span className="status-active">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">SMS Gateway</span>
              </div>
              <span className="status-active">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Database</span>
              </div>
              <span className="status-active">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Messages</h3>
        <div className="overflow-hidden">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Recipient</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Sent At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMessages.map((message) => (
                <tr key={message._id}>
                  <td className="table-cell">{message.recipient}</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      message.type === 'love' 
                        ? 'bg-pink-100 text-pink-800' 
                        : message.type === 'bible'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.type}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`${
                      message.status === 'delivered' ? 'status-active' :
                      message.status === 'sent' ? 'status-pending' :
                      message.status === 'failed' ? 'status-failed' : 'status-inactive'
                    }`}>
                      {message.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {new Date(message.sentAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
