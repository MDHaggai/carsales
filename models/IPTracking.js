import mongoose from 'mongoose';

const ipTrackingSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  location: {
    city: String,
    region: String,
    country: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String,
    required: true,
  }
});

const IPTracking = mongoose.model('IPTracking', ipTrackingSchema);

export default IPTracking;
