import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaEye,
  FaEyeSlash,
  FaUserCircle,
  FaLock,
  FaEnvelope,
  FaImage,
} from 'react-icons/fa';

const Auth = () => {
  const [currentState, setCurrentState] = useState('Login'); // "Login" or "Sign Up"
  const { token, setToken, navigate, backendUrl, cartItems } = useContext(ShopContext);

  // Sign-up fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');

  // Common fields
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');

  // Hide/Show password
  const [showPassword, setShowPassword] = useState(false);

  // optional profile pic
  const [profileFile, setProfileFile]   = useState(null);
  const [profilePicBase64, setProfilePicBase64] = useState('');

  // For password tips pop-up
  const [showPasswordTips, setShowPasswordTips] = useState(false);

  const location = useLocation();

  // Convert file to base64
  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Validate password
  const passwordIsValid = (pwd) => {
    if (pwd.length < 6) return false;
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasDigit  = /\d/.test(pwd);
    return hasLetter && hasDigit;
  };

  // Submit => sign up or login
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        // check password validity
        if (!passwordIsValid(password)) {
          return toast.error('Password must be at least 6 characters with letters and digits.');
        }
        // build sign-up body
        const body = {
          firstName,
          lastName,
          email,
          password,
        };
        if (profilePicBase64) body.profilePicBase64 = profilePicBase64;

        const response = await axios.post(`${backendUrl}/api/user/register`, body);
        if (response.data.success) {
          // This token includes { id: user._id }
          setToken(response.data.token);

          // Now we redirect them
          const redirectTo = location.state?.from 
            || (Object.keys(cartItems).length > 0 ? '/place-order' : '/');
          navigate(redirectTo);
        } else {
          toast.error(response.data.message);
        }
      } else {
        // login
        const body = { email, password };
        const response = await axios.post(`${backendUrl}/api/user/login`, body);
        if (response.data.success) {
          setToken(response.data.token);

          // same redirect logic
          const redirectTo = location.state?.from 
            || (Object.keys(cartItems).length > 0 ? '/place-order' : '/');
          navigate(redirectTo);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // If already have a token => auto redirect
  useEffect(() => {
    if (token) {
      const redirectTo = location.state?.from 
        || (Object.keys(cartItems).length > 0 ? '/place-order' : '/');
      navigate(redirectTo);
    }
    // eslint-disable-next-line
  }, [token]);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-2xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
        </h2>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
          {/* FIRST+LAST if sign-up */}
          {currentState === 'Sign Up' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-lg text-gray-700 mb-1 flex items-center gap-1">
                  <FaUserCircle /> First Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-md focus:outline-none text-base"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-lg text-gray-700 mb-1 flex items-center gap-1">
                  <FaUserCircle /> Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-md focus:outline-none text-base"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-lg text-gray-700 mb-1 flex items-center gap-1">
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border rounded-md focus:outline-none text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="text-lg text-gray-700 mb-1 flex items-center gap-1">
              <FaLock /> Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 border rounded-md focus:outline-none text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              onFocus={() => setShowPasswordTips(true)}
              onBlur={() => setShowPasswordTips(false)}
            />
            {/* Hide / Show icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {/* Password tips pop-up */}
            {currentState === 'Sign Up' && showPasswordTips && (
              <div className="absolute top-[110%] left-0 bg-white border border-gray-300 p-3 rounded-md shadow-md w-full text-sm text-gray-700 z-10">
                <p className="mb-1">Password must contain:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>At least 6 characters</li>
                  <li>At least one letter</li>
                  <li>At least one digit</li>
                </ul>
              </div>
            )}
          </div>

          {/* Profile Pic if sign up */}
          {currentState === 'Sign Up' && (
            <div>
              <label className="text-lg text-gray-700 mb-1 flex items-center gap-1">
                <FaImage /> Profile Picture (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="text-base text-gray-600"
                onChange={handleProfileFileChange}
              />
              {profileFile && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={profilePicBase64}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-full border"
                  />
                  <p className="text-sm text-gray-500">{profileFile.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-black text-white text-lg font-medium px-4 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </form>

        {/* Toggle between Login & Signup */}
        <div className="mt-4 text-center text-lg">
          {currentState === 'Login' ? (
            <p className="text-gray-700">
              Don't have an account?{' '}
              <span
                onClick={() => setCurrentState('Sign Up')}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Register
              </span>
            </p>
          ) : (
            <p className="text-gray-700">
              Already have an account?{' '}
              <span
                onClick={() => setCurrentState('Login')}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Sign In
              </span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;
