// scripts/insertAdmin.js

import mongoose from 'mongoose';
import Admin from '../models/adminModel.js';

// MongoDB connection string
const mongoURI = 'mongodb+srv://richardthomason81:12promax@miniature.3ovlg.mongodb.net/?retryWrites=true&w=majority&appName=Miniature';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const insertAdmin = async () => {
  try {
    const adminEmail = 'haggairameni@gmail.com';
    const adminPassword = '12promax';

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin with this email already exists.');
      mongoose.disconnect();
      return;
    }

    // Create a new admin
    const newAdmin = new Admin({
      email: adminEmail,
      password: adminPassword,
    });

    await newAdmin.save();
    console.log('Admin inserted successfully.');
  } catch (error) {
    console.error('Error inserting admin:', error);
  } finally {
    mongoose.disconnect(); // Ensure the MongoDB connection is closed
  }
};

// Execute the function
insertAdmin();
