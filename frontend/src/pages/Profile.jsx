import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUserData(response.data.user);
        } else {
          toast.error('Failed to fetch user data.');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while fetching user data.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a token
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token, backendUrl]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-xl">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-xl">Loading your profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-xl">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-100">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          My Profile
        </h1>
        <div className="flex flex-col items-center">
          {userData.profilePic ? (
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border mb-4"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full border mb-4 bg-gray-100 text-gray-500">
              No Photo
            </div>
          )}
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {userData.firstName} {userData.lastName}
          </p>
          <p className="text-gray-600 mb-4">{userData.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
