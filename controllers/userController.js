// controllers/userController.js

import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import cloudinary from '../config/cloudinary.js'; // from your config

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { 
        id: user._id,  // Make sure this is included
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// REGISTER
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      profilePicBase64, // optional dataURL
    } = req.body;

    // Ensure user doesn't already exist
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }

    // Validate password: at least 6 chars, letters & digits
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message: 'Password must be at least 6 characters and include letters & digits.',
      });
    }

    // If user provided a profile pic => upload to Cloudinary
    let uploadedPicUrl = '';
    if (profilePicBase64) {
      const uploadRes = await cloudinary.uploader.upload(profilePicBase64, {
        folder: 'users', // or any folder you like
      });
      uploadedPicUrl = uploadRes.secure_url;
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user doc
    const newUser = new userModel({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password: hashedPassword,
      profilePic: uploadedPicUrl,
    });

    const savedUser = await newUser.save();
    const token = createToken(savedUser._id);

    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// ADMIN LOGIN
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// NEW: GET CURRENT LOGGED-IN USER
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // from authMiddleware
    if (!userId) {
      return res.json({ success: false, message: 'Not authorized' });
    }

    // find user by id, excluding the password field
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // success
    return res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// NEW: GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    return res.json({ 
      success: true, 
      users,
      total: users.length 
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // If the request reaches here, it means the token is valid
    // because it passed through authMiddleware
    res.json({
      success: true,
      message: 'Token is valid',
      userId: req.userId
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  getAllUsers, // Add this
};
