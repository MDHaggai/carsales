import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FaEnvelope, FaTrash, FaClock, FaSync } from 'react-icons/fa';

const Subscribers = ({ token }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No authentication token provided');
      setLoading(false);
      return;
    }
    fetchSubscribers();
  }, [token]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${backendUrl}/api/subscriptions/subscribers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data); // Debug log

      if (response.data.success) {
        setSubscribers(response.data.subscribers);
        toast.success(`Loaded ${response.data.count} subscribers`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setError(error.message || 'Failed to load subscribers');
      toast.error(error.message || 'Error loading subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await axios.delete(`${backendUrl}/api/subscriptions/subscribers/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        setSubscribers(prev => prev.filter(sub => sub._id !== id));
        toast.success('Subscriber removed successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error deleting subscriber');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Subscribers</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Total: {subscribers.length}
        </span>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-500 py-8"
        >
          {error}
        </motion.div>
      ) : subscribers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-500 py-8"
        >
          No subscribers found
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {subscribers.map((subscriber) => (
            <motion.div
              key={subscriber._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FaEnvelope className="text-blue-500 text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{subscriber.email}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaClock />
                    <span>Subscribed on {formatDate(subscriber.subscribedAt)}</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(subscriber._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FaTrash />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add a refresh button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchSubscribers}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg"
      >
        <FaSync className={loading ? 'animate-spin' : ''} />
      </motion.button>
    </motion.div>
  );
};

export default Subscribers;