'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function QuotesManager() {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newQuote, setNewQuote] = useState({
    type: 'love',
    title: '',
    content: '',
    author: '',
    language: 'en',
    priority: 5,
    tags: '',
    isActive: true
  });

  useEffect(() => {
    fetchQuotes();
  }, [filter, searchTerm]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/quotes?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setQuotes(data.data);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    try {
      const quoteData = {
        ...newQuote,
        tags: newQuote.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowAddModal(false);
        setNewQuote({
          type: 'love',
          title: '',
          content: '',
          author: '',
          language: 'en',
          priority: 5,
          tags: '',
          isActive: true
        });
        fetchQuotes();
      } else {
        alert('Error adding quote: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding quote:', error);
      alert('Error adding quote');
    }
  };

  const handleUpdateQuote = async (quoteId, updates) => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchQuotes();
        setEditingQuote(null);
      } else {
        alert('Error updating quote: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Error updating quote');
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        fetchQuotes();
      } else {
        alert('Error deleting quote: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Error deleting quote');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filter !== 'all' && quote.type !== filter) return false;
    if (searchTerm && !quote.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !quote.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage love quotes and Bible verses for your subscribers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Quote
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search quotes..."
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
          <option value="all">All Types</option>
          <option value="love">Love Quotes</option>
          <option value="bible">Bible Verses</option>
        </select>
      </div>

      {/* Quotes Table */}
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
                  <th className="table-header">Type</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Content</th>
                  <th className="table-header">Author</th>
                  <th className="table-header">Language</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Usage</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote._id}>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        quote.type === 'love' 
                          ? 'bg-pink-100 text-pink-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {quote.type}
                      </span>
                    </td>
                    <td className="table-cell">{quote.title}</td>
                    <td className="table-cell max-w-xs truncate">
                      {quote.content}
                    </td>
                    <td className="table-cell">{quote.author || '-'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        quote.language === 'en' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {quote.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">{quote.priority}</td>
                    <td className="table-cell">{quote.usageCount}</td>
                    <td className="table-cell">
                      <span className={quote.isActive ? 'status-active' : 'status-inactive'}>
                        {quote.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingQuote(quote)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Quote Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Quote</h3>
              <form onSubmit={handleAddQuote} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newQuote.type}
                      onChange={(e) => setNewQuote({...newQuote, type: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="love">Love Quote</option>
                      <option value="bible">Bible Verse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={newQuote.language}
                      onChange={(e) => setNewQuote({...newQuote, language: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newQuote.title}
                    onChange={(e) => setNewQuote({...newQuote, title: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newQuote.content}
                    onChange={(e) => setNewQuote({...newQuote, content: e.target.value})}
                    className="input-field"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={newQuote.author}
                      onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newQuote.priority}
                      onChange={(e) => setNewQuote({...newQuote, priority: parseInt(e.target.value)})}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newQuote.tags}
                    onChange={(e) => setNewQuote({...newQuote, tags: e.target.value})}
                    className="input-field"
                    placeholder="inspiration, daily, motivation"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Add Quote
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
