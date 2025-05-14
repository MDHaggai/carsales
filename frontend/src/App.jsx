// App.jsx

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Review from './pages/Review';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify';
import OrderConfirmation from './pages/OrderConfirmation';
import ErrorBoundary from './components/ErrorBoundary';
import Profile from './pages/Profile';
import FAQ from './pages/FAQ';
import background from './assets/background.jpg';
import AdminPanel from './pages/AdminPanel';

import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
export const currency = '$';

const App = () => {
  const location = useLocation();

  // Only keep the scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative min-h-screen bg-white/90">
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 99999 }}
        />
        <div className='relative z-10'>
          <Navbar />
          <SearchBar />
          <main className="w-full">
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/collection' element={<Collection />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/product/:productId' element={<Product />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/login' element={<Login />} />
              <Route path='/place-order' element={<PlaceOrder />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/verify' element={<Verify />} />
              <Route path='/review' element={<Review />} />
              <Route path='/order-confirmation' element={<OrderConfirmation />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/faq' element={<FAQ />} />
              <Route path='/admin/*' element={<AdminPanel />} />
              <Route path='*' element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
