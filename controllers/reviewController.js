// controllers/reviewController.js
import Review from '../models/reviewModel.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

/**
 * GET ALL REVIEWS
 */
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Update the populate options to include more product fields
    const reviews = await Review.find()
      .populate({
        path: 'productId',
        select: 'name brand model year',
        model: 'product' // Make sure this matches your Product model name
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Fetched reviews:', reviews); // Debug log

    const total = await Review.countDocuments();

    return res.json({
      success: true,
      reviews,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET REVIEWS FOR A SPECIFIC PRODUCT
 */
export const getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Fetching reviews for productId: ${productId}`);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error(`Invalid productId: ${productId}`);
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const reviews = await Review.find({ productId })
      .populate('productId', 'name')
      .sort({ date: -1 });

    console.log(`Found ${reviews.length} reviews for productId: ${productId}`);
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(`Error fetching reviews: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * ADD A NEW REVIEW
 * 
 * If user is authenticated (req.userId), we fetch their user doc
 * to fill in email/profilePic from the DB. If not logged in, we 
 * require an 'email' from the request body. 
 * If a file is uploaded, it overrides the DB or sets a new profilePic.
 */
export const addReview = async (req, res) => {
  try {
    const { productId, firstName, lastName, text, rating, date } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Handle file upload if present
    let profilePicUrl = req.body.profilePic || null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'reviews',
        public_id: `review-${productId}-${Date.now()}`,
        resource_type: 'image'
      });
      profilePicUrl = result.secure_url;
    }

    // Create and save the review
    const newReview = new Review({
      productId,
      firstName,
      lastName,
      text,
      rating: Number(rating),
      date: date || new Date(),
      profilePic: profilePicUrl
    });

    await newReview.save();

    const populatedReview = await Review.findById(newReview._id)
      .populate('productId', 'name');

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: populatedReview
    });

  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error adding review'
    });
  }
};
/**
 * UPDATE A REVIEW
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating review with id: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid review id: ${id}`);
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const { email, text, rating, date } = req.body;
    let profilePic = undefined;

    // If there's a new file => upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'reviews',
        public_id: `${id}-${Date.now()}`,
        resource_type: 'image'
      });
      profilePic = result.secure_url;
    }

    const updatedData = {
      email,
      text,
      rating: Number(rating),
      date: date ? new Date(date) : new Date(),
    };
    if (profilePic) updatedData.profilePic = profilePic;

    const updatedReview = await Review.findByIdAndUpdate(id, updatedData, { new: true })
      .populate('productId', 'name');
    if (!updatedReview) {
      console.error(`Review not found with id: ${id}`);
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    console.log('Review updated:', updatedReview);
    res.status(200).json({ success: true, review: updatedReview });
  } catch (error) {
    console.error(`Error updating review: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * DELETE A REVIEW
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting review with id: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid review id: ${id}`);
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      console.error(`Review not found with id: ${id}`);
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    console.log('Review deleted:', deletedReview);
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error(`Error deleting review: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
