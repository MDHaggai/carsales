import Subscription from '../models/subscriptionModel.js';

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingSubscription = await Subscription.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    // Create new subscription
    const newSubscription = new Subscription({
      email,
      isActive: true
    });

    await newSubscription.save();

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscription: newSubscription
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing subscription',
      error: error.message
    });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    
    const subscription = await Subscription.findOne({ email });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.isActive = false;
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing unsubscribe request'
    });
  }
};

export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscription.find()
      .sort({ createdAt: -1 }); // Use createdAt instead of subscriptionDate

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscribers'
    });
  }
};