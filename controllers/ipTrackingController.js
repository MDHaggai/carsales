import IPTracking from '../models/IPTracking.js';
import axios from 'axios';

// Helper function to get IP address and location
const getIPAndLocation = async () => {
  try {
    // Get the user's IP address
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const userIp = ipResponse.data.ip;

    // Get location details based on IP address
    const locationResponse = await axios.get(`http://ip-api.com/json/${userIp}`);
    const { city, regionName: region, country } = locationResponse.data;
    const location = { city, region, country };

    return { userIp, location };
  } catch (error) {
    console.error('Error fetching IP and location:', error);
    throw new Error('Failed to get IP and location');
  }
};

// Function to track product clicks
export const trackClicks = async (req, res) => {
  const { productId } = req.body;

  try {
    const { userIp, location } = await getIPAndLocation();

    // Create a new IP tracking document for clicks
    const newTracking = new IPTracking({ ip: userIp, location, action: 'click', productId });

    // Save to database
    await newTracking.save();

    res.status(200).json({ success: true, message: 'Product click tracked successfully.' });
  } catch (error) {
    console.error('Error tracking product click:', error);
    res.status(500).json({ success: false, message: 'Failed to track product click.' });
  }
};

// Function to track video views
export const trackVideos = async (req, res) => {
  const { videoId } = req.body;

  try {
    const { userIp, location } = await getIPAndLocation();

    // Create a new IP tracking document for video views
    const newTracking = new IPTracking({ ip: userIp, location, action: 'view', videoId });

    // Save to database
    await newTracking.save();

    res.status(200).json({ success: true, message: 'Video view tracked successfully.' });
  } catch (error) {
    console.error('Error tracking video view:', error);
    res.status(500).json({ success: false, message: 'Failed to track video view.' });
  }
};

// Function to track page views
export const trackPageViews = async (req, res) => {
  const { pageUrl } = req.body;

  try {
    const { userIp, location } = await getIPAndLocation();

    // Create a new IP tracking document for page views
    const newTracking = new IPTracking({ ip: userIp, location, action: 'pageview', pageUrl });

    // Save to database
    await newTracking.save();

    res.status(200).json({ success: true, message: 'Page view tracked successfully.' });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ success: false, message: 'Failed to track page view.' });
  }
};

// Function to track add-to-cart actions
export const trackAddToCart = async (req, res) => {
  const { productId } = req.body;

  try {
    const { userIp, location } = await getIPAndLocation();

    // Create a new IP tracking document for add-to-cart actions
    const newTracking = new IPTracking({ ip: userIp, location, action: 'addtocart', productId });

    // Save to database
    await newTracking.save();

    res.status(200).json({ success: true, message: 'Add to cart action tracked successfully.' });
  } catch (error) {
    console.error('Error tracking add to cart action:', error);
    res.status(500).json({ success: false, message: 'Failed to track add to cart action.' });
  }
};
