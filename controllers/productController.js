// controllers/productController.js
import fs from 'fs';
import brandModel from '../models/brandModel.js';
import productModel from '../models/productModel.js';
import cloudinary from '../config/cloudinary.js'; // <-- Import the configured Cloudinary object


// Function to add a product
const addProduct = async (req, res) => {
  try {
    const {
      name, // This line was added
      brand,
      model,
      year,
      description,
      price,
      downPayment,
      monthlyPayment,
      mileage,
      condition,
      transmission,
      fuelType,
      features,
      bestseller,
    } = req.body;

    // Verify brand exists
    const brandExists = await brandModel.findOne({ name: brand });
    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected brand does not exist',
      });
    }

    // -------------------------
    // Handle Image Uploads
    // -------------------------
    const images = [];
    for (let i = 1; i <= 8; i++) { // Updated to handle 8 images
      if (req.files && req.files[`image${i}`]) {
        try {
          // use the configured cloudinary object's .uploader.upload
          const result = await cloudinary.uploader.upload(
            req.files[`image${i}`][0].path,
            {
              resource_type: 'auto',
              folder: 'car-listings',
            }
          );
          images.push(result.secure_url);
          // clean up temp file
          fs.unlinkSync(req.files[`image${i}`][0].path);
        } catch (uploadError) {
          console.error(`Error uploading image ${i}:`, uploadError);
          throw new Error(`Failed to upload image ${i}`);
        }
      }
    }

    // -------------------------
    // Handle Video Uploads
    // -------------------------
    const videos = [];
    for (let i = 1; i <= 2; i++) {
      if (req.files && req.files[`video${i}`]) {
        try {
          const result = await cloudinary.uploader.upload(
            req.files[`video${i}`][0].path,
            {
              resource_type: 'video',
              folder: 'car-videos',
            }
          );
          videos.push(result.secure_url);
          fs.unlinkSync(req.files[`video${i}`][0].path);
        } catch (uploadError) {
          console.error(`Error uploading video ${i}:`, uploadError);
          throw new Error(`Failed to upload video ${i}`);
        }
      }
    }

    // Build product object
    const productData = {
      name,
      brand,
      brandLogo: brandExists.logo,
      model,
      year: Number(year),
      description,
      price: Number(price),
      downPayment: Number(downPayment),
      monthlyPayment: Number(monthlyPayment),
      mileage: Number(mileage),
      condition,
      transmission,
      fuelType,
      features: typeof features === 'string' ? JSON.parse(features) : features,
      images,
      videos,
      bestseller: bestseller === 'true',
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: 'Vehicle Listed Successfully',
      product,
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding product',
    });
  }
};

// ----------------------------------------------------------------
// List products
// ----------------------------------------------------------------
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ date: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// Remove product
// ----------------------------------------------------------------
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: 'Product Removed' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// Single product info
// ----------------------------------------------------------------
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// Add a review
// ----------------------------------------------------------------
const addReview = async (req, res) => {
  try {
    const { productId, email, text, rating } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    const newReview = {
      email,
      text,
      rating,
      date: new Date(),
    };

    product.reviews.push(newReview);
    await product.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      reviews: product.reviews,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// Bring product to top
// ----------------------------------------------------------------
const bringProductToTop = async (req, res) => {
  try {
    const { id } = req.body;
    
    // Find the product to move
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Update the product's timestamp to move it to top
    product.updatedAt = new Date();
    await product.save();

    res.status(200).json({ 
      success: true, 
      message: 'Product moved to the top successfully.' 
    });
  } catch (error) {
    console.error('Error bringing product to the top:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error.' 
    });
  }
};

// ----------------------------------------------------------------
// Toggle popular status (previously toggleBestSeller)
// ----------------------------------------------------------------
const togglePopular = async (req, res) => {
  try {
    const { id, isPopular } = req.body;
    
    const product = await productModel.findByIdAndUpdate(
      id,
      { $set: { isPopular } }, // Use $set to only update isPopular field
      { 
        new: true,
        runValidators: false, // Disable validation since we're only updating one field
        validateModifiedOnly: true
      }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found.' 
      });
    }

    res.status(200).json({
      success: true,
      message: `Product ${isPopular ? 'marked as popular' : 'removed from popular'} successfully.`,
      product
    });
  } catch (error) {
    console.error('Error toggling popular status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating product status.' 
    });
  }
};

// ----------------------------------------------------------------
// Update product
// ----------------------------------------------------------------
const updateProduct = async (req, res) => {
  try {
    console.log('MULTIPART TEXT FIELDS =>', req.body);
    // If this logs an empty object, Multer isn't set up properly. 
    // Otherwise you'll see brand, price, etc.

    // 1) Find the existing product
    const { id } = req.params;
    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2) Build your "updates" object from existing
    let updates = { ...existingProduct.toObject() };

    // 3) Overwrite text fields from req.body
    const textFields = ['name','brand','model','description','condition','transmission','fuelType'];
    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // 4) Parse "isPopular"
    if (req.body.isPopular !== undefined) {
      updates.isPopular = req.body.isPopular === 'true' || req.body.isPopular === true;
    }

    // 5) numeric fields
    const numericFields = ['year','price','downPayment','monthlyPayment','mileage'];
    numericFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        const val = parseFloat(req.body[field]);
        if (!isNaN(val)) {
          updates[field] = val;
        }
      }
    });

    // 6) features (could be JSON string)
    if (req.body.features) {
      if (typeof req.body.features === 'string') {
        updates.features = JSON.parse(req.body.features);
      } else {
        updates.features = req.body.features;
      }
    }

    // 7) If brand changed, update brandLogo
    if (updates.brand && updates.brand !== existingProduct.brand) {
      const brandExists = await brandModel.findOne({ name: updates.brand });
      if (brandExists) {
        updates.brandLogo = brandExists.logo;
      }
    }

    // 8) Handle new images / videos
    if (req.files) {
      const newImages = [];
      const newVideos = [];

      // Images
      for (let i = 1; i <= 8; i++) {
        if (req.files[`image${i}`]) {
          const result = await cloudinary.uploader.upload(
            req.files[`image${i}`][0].path,
            { resource_type: 'auto', folder: 'car-listings' }
          );
          newImages.push(result.secure_url);
          fs.unlinkSync(req.files[`image${i}`][0].path);
        }
      }
      if (newImages.length > 0) {
        updates.images = newImages; 
      }

      // Videos
      for (let i = 1; i <= 2; i++) {
        if (req.files[`video${i}`]) {
          const result = await cloudinary.uploader.upload(
            req.files[`video${i}`][0].path,
            { resource_type: 'video', folder: 'car-videos' }
          );
          newVideos.push(result.secure_url);
          fs.unlinkSync(req.files[`video${i}`][0].path);
        }
      }
      if (newVideos.length > 0) {
        updates.videos = newVideos;
      }
    }

    // 9) Cleanup
    delete updates._id;
    delete updates.__v;
    updates.updatedAt = new Date();

    // 10) Update the doc
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    console.log('APPLYING UPDATES =>', updates);
    console.log('UPDATED PRODUCT =>', updatedProduct);

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};
// ----------------------------------------------------------------
// Get product by ID
// ----------------------------------------------------------------
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the product ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Fetch the product
    const product = await productModel.findById(id)
      .populate('brand', 'name logo') // Populate brand name and logo if applicable
      .select('-__v') // Exclude version key
      .lean(); // Convert to plain JavaScript object

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Ensure all numeric fields are properly converted
    const formattedProduct = {
      ...product,
      price: Number(product.price),
      downPayment: Number(product.downPayment),
      monthlyPayment: Number(product.monthlyPayment),
      mileage: Number(product.mileage),
      year: Number(product.year)
    };

    res.json({
      success: true,
      product: formattedProduct
    });
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// ----------------------------------------------------------------
// Get Latest Products
// ----------------------------------------------------------------
const getLatestProducts = async (req, res) => {
  try {
    const latestProducts = await productModel
      .find({})
      .sort({ date: -1 })
      .limit(5);
    res.json({ success: true, products: latestProducts });
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// Get Best Sellers
// ----------------------------------------------------------------
const getBestSellers = async (req, res) => {
  try {
    const popularProducts = await productModel
      .find({ isPopular: true })  // Changed from bestseller to isPopular
      .sort({ updatedAt: -1 });
    
    // Debug log
    console.log('Found popular products:', popularProducts.length);

    res.json({ 
      success: true, 
      products: popularProducts
    });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching popular products'
    });
  }
};

// Export all
export {
  addReview,
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  bringProductToTop,
  togglePopular,
  updateProduct,
  getProductById,
  getLatestProducts,
  getBestSellers,
};
