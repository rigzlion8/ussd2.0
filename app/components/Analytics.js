'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    dailyStats: [],
    messageTypeStats: [],
    deliveryStats: [],
    totalUsers: 0,
    activeSubscriptions: 0,
    totalMessages: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('range', timeRange);
      
      const response = await fetch(`/api/admin/analytics?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-KE').format(num);
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform performance and subscriber insights
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-48"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.totalUsers)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.activeSubscriptions)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Messages Sent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.totalMessages)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Message Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message Type Distribution</h3>
          <div className="space-y-3">
            {analytics.messageTypeStats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    stat._id === 'love' ? 'bg-pink-500' :
                    stat._id === 'bible' ? 'bg-blue-500' :
                    stat._id === 'welcome' ? 'bg-green-500' :
                    stat._id === 'payment' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat._id} Messages
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(stat.count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Status</h3>
          <div className="space-y-3">
            {analytics.deliveryStats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    stat._id === 'delivered' ? 'bg-green-500' :
                    stat._id === 'sent' ? 'bg-yellow-500' :
                    stat._id === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat._id}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(stat.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Message Activity</h3>
        <div className="space-y-3">
          {analytics.dailyStats.map((stat) => (
            <div key={stat._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  {new Date(stat._id).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (stat.count / Math.max(...analytics.dailyStats.map(s => s.count))) * 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {stat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Rate</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.deliveryStats.length > 0 ? 
                Math.round((analytics.deliveryStats.find(s => s._id === 'delivered')?.count || 0) / 
                analytics.deliveryStats.reduce((sum, s) => sum + s.count, 0) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-500 mt-1">Successful deliveries</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Average Daily Messages</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {analytics.dailyStats.length > 0 ? 
                Math.round(analytics.dailyStats.reduce((sum, s) => sum + s.count, 0) / analytics.dailyStats.length) : 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Messages per day</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue per User</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(analytics.totalUsers > 0 ? analytics.totalRevenue / analytics.totalUsers : 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Average user value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
