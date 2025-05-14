import { v2 as cloudinary } from 'cloudinary';
import brandModel from '../models/brandModel.js';

export const addBrand = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand logo is required" 
            });
        }

        // Upload logo to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'brand-logos'
        });

        const brand = new brandModel({
            name,
            description,
            logo: result.secure_url
        });

        await brand.save();

        res.json({ 
            success: true, 
            message: "Brand added successfully",
            brand
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update listBrands to sort by order
export const listBrands = async (req, res) => {
    try {
        const brands = await brandModel.find({})
            .sort({ order: -1, createdAt: -1 });
        res.json({ 
            success: true, 
            brands
        });
    } catch (error) {
        console.error('Brand listing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching brands'
        });
    }
};

export const updateBrand = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Brand ID is required"
            });
        }

        // Find existing brand
        const existingBrand = await brandModel.findById(id);
        if (!existingBrand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        // Prepare update data
        const updateData = {
            name: name || existingBrand.name,
            description: description || existingBrand.description
        };

        // Handle logo upload if new file is provided
        if (req.file) {
            try {
                // Upload new logo to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'brand-logos'
                });
                updateData.logo = result.secure_url;

                // Optional: Delete old logo from Cloudinary
                if (existingBrand.logo) {
                    const publicId = existingBrand.logo.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`brand-logos/${publicId}`);
                }
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading logo"
                });
            }
        }

        // Update brand in database
        const updatedBrand = await brandModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('Updated brand:', updatedBrand); // Debug log

        res.json({
            success: true,
            message: "Brand updated successfully",
            brand: updatedBrand
        });

    } catch (error) {
        console.error('Brand update error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating brand"
        });
    }
};

export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.body;
        await brandModel.findByIdAndDelete(id);
        res.json({ 
            success: true, 
            message: "Brand deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const bringToTop = async (req, res) => {
    try {
        const { id } = req.body;

        // Find the brand to update
        const brand = await brandModel.findById(id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        // Get the highest order value
        const highestOrder = await brandModel.findOne({}, 'order')
            .sort({ order: -1 })
            .limit(1);

        const newOrder = (highestOrder?.order || 0) + 1;

        // Update the brand's order
        const updatedBrand = await brandModel.findByIdAndUpdate(
            id,
            { order: newOrder },
            { new: true }
        );

        res.json({
            success: true,
            message: "Brand brought to top successfully",
            brand: updatedBrand
        });

    } catch (error) {
        console.error('Bring to top error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error bringing brand to top"
        });
    }
};