// routes/productRouter.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
  addReview,
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  bringProductToTop,
  getLatestProducts,
  getBestSellers,
  togglePopular,
  updateProduct,
  getProductById
} from '../controllers/productController.js';

import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Setup __filename & __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Multer for file uploads
// This uses diskStorage to temporarily store files in /uploads before you
// do cloudinary.uploader.upload(...) in the controller
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save the file temporarily in 'uploads' folder
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    // Attach a timestamp to ensure uniqueness
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// We can handle up to 8 images & 2 videos
const fileFields = [
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 },
  { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 },
  { name: 'image8', maxCount: 1 },
  { name: 'video1', maxCount: 1 },
  { name: 'video2', maxCount: 1 }
];

// ------------------------
//    ROUTES
// ------------------------

// 1) Add new product (POST /add)
productRouter.post('/add', adminAuth, upload.fields(fileFields), addProduct);

// 2) Add a review
productRouter.post('/add-review', addReview);

// 3) Remove product
productRouter.post('/remove', adminAuth, removeProduct);

// 4) Single product by ID (old approach with /single and a body param):
productRouter.post('/single', singleProduct);

// 5) Get all products
productRouter.get('/list', listProducts);

// 6) Bring product to top
productRouter.post('/bring-to-top', adminAuth, bringProductToTop);

// 7) Latest and best-sellers
productRouter.get('/latest', getLatestProducts);
productRouter.get('/best-sellers', getBestSellers);

// 8) Toggle popular
productRouter.post('/toggle-popular', adminAuth, togglePopular);

// 9) Get a product by ID (HTTP GET /product/:id)
//    If you want to require adminAuth, that's your choice. 
//    Otherwise remove adminAuth to let anyone fetch it.
productRouter.get('/product/:id', getProductById);

// 10) Update product (PUT /update/:id)
//     KEY FIX: We add upload.fields(...) so text fields get parsed into req.body
productRouter.put('/update/:id', adminAuth, upload.fields(fileFields), updateProduct);

export default productRouter;
