import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product', // This now matches the model name in productModel.js
    required: true,
    index: true // Add index for better query performance
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  profilePic: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false
  }
}, {
  timestamps: true
});

// Add index for common queries
reviewSchema.index({ productId: 1, date: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
