'use client';

import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, [searchTerm, filter, statusFilter]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/messages?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'sent':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredMessages = messages.filter(message => {
    if (searchTerm && !message.recipient.includes(searchTerm) && 
        !message.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor SMS delivery and message history
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Types</option>
          <option value="love">Love Quotes</option>
          <option value="bible">Bible Verses</option>
          <option value="welcome">Welcome Messages</option>
          <option value="payment">Payment Notifications</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Messages Table */}
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
                  <th className="table-header">Recipient</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Content</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Channel</th>
                  <th className="table-header">Sent At</th>
                  <th className="table-header">Delivered At</th>
                  <th className="table-header">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message._id}>
                    <td className="table-cell">{message.recipient}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.type === 'love' 
                          ? 'bg-pink-100 text-pink-800' 
                          : message.type === 'bible'
                          ? 'bg-blue-100 text-blue-800'
                          : message.type === 'welcome'
                          ? 'bg-green-100 text-green-800'
                          : message.type === 'payment'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.type}
                      </span>
                    </td>
                    <td className="table-cell max-w-xs">
                      <div className="truncate" title={message.content}>
                        {message.content}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getStatusIcon(message.status)}
                        <span className={`ml-2 ${
                          message.status === 'delivered' ? 'status-active' :
                          message.status === 'sent' ? 'status-pending' :
                          message.status === 'failed' ? 'status-failed' : 'status-inactive'
                        }`}>
                          {message.status}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.channel === 'sms' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {message.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">
                      {message.sentAt ? new Date(message.sentAt).toLocaleString() : '-'}
                    </td>
                    <td className="table-cell">
                      {message.deliveredAt ? new Date(message.deliveredAt).toLocaleString() : '-'}
                    </td>
                    <td className="table-cell">
                      {message.cost ? `Ksh ${message.cost}` : '-'}
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
