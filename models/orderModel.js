import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    _id: String,
    price: Number,
    totalPrice: Number,
    downPayment: Number,
    monthlyPayment: Number,
    quantity: Number,
    images: [String],
    brand: String,
    model: String,
    year: String
  }],
  shipping: {
    origin: {
      lat: Number,
      lng: Number,
      address: String
    },
    destination: {
      lat: Number,
      lng: Number,
      address: String
    },
    route: Array,
    currentLocation: {
      lat: Number,
      lng: Number
    },
    distance: Number,
    duration: Number,
    movementStatus: {
      type: String,
      enum: ['not_started', 'on_transit', 'paused'],
      default: 'not_started',
      validate: {
        validator: function(v) {
          return ['not_started', 'on_transit', 'paused'].includes(v);
        },
        message: props => `${props.value} is not a valid movement status`
      }
    },
    progress: {
      type: Number,
      default: 0
    },
    timeTracking: {
      startedAt: Date,
      pausedAt: Date,
      totalPausedTime: Number,
      estimatedDuration: Number,
      remainingTime: Number,
      lastCalculatedAt: Date
    },
    lastUpdated: Date
  },
  status: String,
  payment: Boolean,
  paymentMethod: String,
  date: Date,
  address: {
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentSchedule: [{
    dueDate: Date,
    amount: Number,
    isPaid: Boolean,
    paymentNumber: Number,
    isDownPayment: Boolean,
    paidDate: Date,
    paidBy: String,
    paymentMethod: String,
    transactionId: String,
    notes: String
  }],
  paymentTracking: {
    totalPayments: Number,
    totalPrice: Number,
    amountPaid: Number,
    remainingAmount: Number,
    nextPaymentDue: Date,
    monthlyPayment: Number,
    downPayment: Number
  }
}, {
  timestamps: true
});

// Add a method to calculate current remaining time
orderSchema.methods.calculateRemainingTime = function() {
  const shipping = this.shipping;
  if (!shipping?.timeTracking?.startedAt) return 0;

  const now = new Date();
  let elapsedTime = 0;

  if (shipping.movementStatus === 'on_transit') {
    elapsedTime = (now - new Date(shipping.timeTracking.startedAt)) / (1000 * 60);
    elapsedTime -= (shipping.timeTracking.totalPausedTime || 0);
  } else if (shipping.movementStatus === 'paused') {
    elapsedTime = (shipping.timeTracking.pausedAt - shipping.timeTracking.startedAt) / (1000 * 60);
    elapsedTime -= (shipping.timeTracking.totalPausedTime || 0);
  }

  const remainingTime = Math.max(0, shipping.timeTracking.estimatedDuration - elapsedTime);
  
  // Update the stored remaining time
  this.shipping.timeTracking.remainingTime = remainingTime;
  this.shipping.timeTracking.lastCalculatedAt = now;
  
  return remainingTime;
};

orderSchema.pre('save', function(next) {
  if (this.shipping && !['not_started', 'on_transit', 'paused'].includes(this.shipping.movementStatus)) {
    this.shipping.movementStatus = 'not_started';
  }
  next();
});

export default mongoose.model('Order', orderSchema);