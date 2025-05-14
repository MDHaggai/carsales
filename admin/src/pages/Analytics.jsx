import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import Title from '../components/Title';

const backendUrl = "https://miniaturearsenal-cd903da66642.herokuapp.com"; // Replace with your backend URL

const Analytics = () => {
  const [clickData, setClickData] = useState([]);
  const [videoData, setVideoData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    await fetchClickData();
    await fetchVideoData();
    await fetchUserData();
    await fetchCartData();
    await fetchVisitorData();
  };

  const fetchClickData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/analytics/clicks`);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setClickData(response.data);
      } else {
        console.warn('Click data is empty or not an array');
        setClickData([]);  // Set empty array to avoid errors
      }
    } catch (error) {
      console.error('Error fetching click data:', error);
    }
  };

  const fetchVideoData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/analytics/videos`);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setVideoData(response.data);
      } else {
        console.warn('Video data is empty or not an array');
        setVideoData([]);  // Set empty array to avoid errors
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/analytics/users`);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setUserData(response.data);
      } else {
        console.warn('User data is empty or not an array');
        setUserData([]);  // Set empty array to avoid errors
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCartData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/analytics/cart`);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setCartData(response.data);
      } else {
        console.warn('Cart data is empty or not an array');
        setCartData([]);  // Set empty array to avoid errors
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const fetchVisitorData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/analytics/visitors`);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setVisitorData(response.data);
      } else {
        console.warn('Visitor data is empty or not an array');
        setVisitorData([]);  // Set empty array to avoid errors
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className='p-6'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'WEBSITE'} text2={'ANALYTICS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Gain insights into user behavior on your website with our detailed analytics. Track activities like product clicks, video views, items added to the cart by IP address, and user registrations to understand user interactions.
        </p>
      </div>

      {/* Conditional rendering based on data availability */}
      {visitorData.length > 0 ? (
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-center mb-4'>Website Visitors by Location</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visitorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ location }) => location}
                outerRadius={80}
                fill="#8884d8"
                dataKey="visitors"
              >
                {visitorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className='text-center'>No visitor data available</p>
      )}

      {/* Repeat similar condition for other data visualizations */}
    </div>
  );
};

export default Analytics;
