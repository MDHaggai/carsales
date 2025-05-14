import express from 'express';
import {
  getReviewsForProduct,
  addReview,
  updateReview,
  deleteReview,
  getAllReviews
} from '../controllers/reviewController.js';
import upload from '../middleware/multer.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', getAllReviews);
router.get('/:productId', getReviewsForProduct);

// Regular user route with auth
router.post('/user', authMiddleware, upload.single('profilePic'), addReview);

// Admin route without auth
router.post('/', upload.single('profilePic'), addReview);

router.put('/:id', upload.single('profilePic'), updateReview);
router.delete('/:id', deleteReview);

export default router;
