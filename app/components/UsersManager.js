'use client';

import { useState, useEffect } from 'react';
import { EyeIcon, PhoneIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchTerm && !user.phoneNumber.includes(searchTerm) && 
        !user.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscribers and their subscriptions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by phone or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="subscribed">With Subscriptions</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Phone Number</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Active Subscriptions</th>
                  <th className="table-header">Total Spent</th>
                  <th className="table-header">Language</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Last Activity</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {user.phoneNumber}
                      </div>
                    </td>
                    <td className="table-cell">{user.name || 'N/A'}</td>
                    <td className="table-cell">
                      <div className="flex space-x-1">
                        {user.subscriptionHistory
                          .filter(sub => sub.isActive && new Date() <= sub.endDate)
                          .map((sub, index) => (
                            <span key={index} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              sub.type === 'love' 
                                ? 'bg-pink-100 text-pink-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sub.type}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                        Ksh {user.totalSpent || 0}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.preferences?.language === 'en' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.preferences?.language?.toUpperCase() || 'EN'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="table-cell">
                      <button className="text-primary-600 hover:text-primary-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
