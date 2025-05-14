import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import Brands from './pages/Brands';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users'; // Add this import
import Subscribers from './pages/Subscribers'; // Add this import
import OrderDetails from './pages/OrderDetails';
import ListDetails from './pages/ListDetails'; // Add the new import

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '$';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  // Add debug logging
  useEffect(() => {
    console.log('Current pathname:', window.location.pathname);
    console.log('Token status:', !!token);
  }, [token]);

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <main className='flex-1 p-8 ml-[max(5vw,25px)] overflow-x-hidden'>
              <Routes>
                <Route exact path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route exact path="/admin/dashboard" element={<Dashboard token={token} />} />
                <Route exact path="/admin/add" element={<Add token={token} />} />
                <Route exact path="/admin/list" element={<List token={token} />} />
                <Route exact path="/admin/orders" element={<Orders token={token} />} />
                <Route path="/admin/order/:orderId" element={<OrderDetails token={token} />} />
                <Route exact path="/admin/brands" element={<Brands token={token} />} />
                <Route exact path="/admin/users" element={<Users token={token} />} />
                <Route exact path="/admin/reviews" element={<Reviews token={token} />} />
                <Route exact path="/admin/analytics" element={<Analytics />} />
                <Route exact path="/admin/subscribers" element={<Subscribers token={token} />} />
                <Route path="/admin/list/:id" element={<ListDetails token={token} />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;