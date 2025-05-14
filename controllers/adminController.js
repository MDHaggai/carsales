import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Admin login using credentials from .env
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if provided credentials match the ones stored in the .env file.
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT token
      const token = jwt.sign(
        { id: 'admin', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '500h' }
      );

      return res.json({ 
        success: true, 
        message: 'Admin logged in successfully',
        token 
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add getAllUsers function
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')  // Exclude password from the response
      .sort({ createdAt: -1 });  // Sort by newest first

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};
