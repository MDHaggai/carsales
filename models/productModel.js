import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: { type: String, required: true },
    brandLogo: { type: String }, // Add this field to store brand logo URL
    model: { type: String, required: true },
    year: { type: Number, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    downPayment: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    mileage: { type: Number, required: true },
    condition: { type: String, required: true },
    transmission: { type: String, required: true },
    fuelType: { type: String, required: true },
    images: [{ type: String, required: true }], // Array of image URLs
    videos: { type: Array },
    features: { type: Array },
    isPopular: { 
        type: Boolean, 
        default: false 
    }, // Changed from bestseller
    date: { type: Date, default: Date.now },
}, { timestamps: true });

// Change this line to use consistent model name
const Product = mongoose.model("product", productSchema);
export default Product;
