import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/api/user/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        const errorMsg = response.data.message || 'Failed to fetch users';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error loading users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to check for token
  useEffect(() => {
    if (!token) {
      setError('No authentication token available');
      return;
    }
    fetchUsers();
  }, [token]);

  // Add this effect to monitor users state
  useEffect(() => {
    console.log('Users state updated:', users);
  }, [users]);

  const filteredUsers = users
    .filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const UserCard = ({ user }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUser className="w-8 h-8 text-blue-500" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center text-gray-500 text-sm space-x-4">
              <div className="flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2" />
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedUser(user)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
        <p>Token present: {Boolean(token).toString()}</p>
        <p>Loading: {loading.toString()}</p>
        <p>Users count: {users.length}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {/* Add Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Management</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            Sort by Date
          </motion.button>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {filteredUsers.map(user => (
              <UserCard key={user._id} user={user} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6"
            >
              <h2 className="text-xl font-bold mb-4">User Details</h2>
              <div className="space-y-4">
                <div className="flex justify-center">
                  {selectedUser.profilePic ? (
                    <img 
                      src={selectedUser.profilePic}
                      alt={selectedUser.firstName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaUser className="w-16 h-16 text-blue-500" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedUser(null)}
                className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;