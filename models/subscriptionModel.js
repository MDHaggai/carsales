import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;