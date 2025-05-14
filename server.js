import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import cloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import ipTrackingRouter from './routes/ipTrackingRoute.js';

import adminRouter from './routes/adminRoutes.js';
import brandRouter from './routes/brandRoute.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import subscriptionRoute from './routes/subscriptionRoute.js';

import { WebSocketServer } from 'ws';

// Initialize __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Define tracking functions before using them
const trackingIntervals = new Map();

const startOrderTracking = (data, ws) => {
  const { orderId, route, totalDuration } = data;
  if (trackingIntervals.has(orderId)) {
    clearInterval(trackingIntervals.get(orderId));
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += 0.1;
    if (progress >= 100) {
      clearInterval(interval);
      trackingIntervals.delete(orderId);
      return;
    }

    const routeIndex = Math.floor((route.length - 1) * (progress / 100));
    const position = route[routeIndex];
    const remainingTime = totalDuration * (1 - progress / 100);

    const updateData = {
      type: 'locationUpdate',
      position,
      progress,
      remainingTime
    };

    ws.send(JSON.stringify(updateData));
  }, 1000);

  trackingIntervals.set(orderId, interval);
};

const stopOrderTracking = (orderId) => {
  if (trackingIntervals.has(orderId)) {
    clearInterval(trackingIntervals.get(orderId));
    trackingIntervals.delete(orderId);
  }
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)  // Changed from MONGODB_URI to MONGO_URI
  .then(() => {
    console.log('Connected to MongoDB');
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    const wss = new WebSocketServer({ server });
    const clients = new Map();

    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'subscribe':
              clients.set(data.orderId, ws);
              break;
              
            case 'startTracking':
              startOrderTracking(data, ws);
              break;
              
            case 'stopTracking':
              stopOrderTracking(data.orderId);
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        // Clean up client connections and tracking intervals
        for (const [orderId, client] of clients.entries()) {
          if (client === ws) {
            stopOrderTracking(orderId);
            clients.delete(orderId);
            break;
          }
        }
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://autocar-6d8b884c5ec9.herokuapp.com',
  'https://www.1autocarsale.com',
  'www.1autocarsale.com'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'token',
    'Accept',
    'x-access-token'
  ],
  credentials: true,
  maxFileSize: 50 * 1024 * 1024 // 50MB max file size
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3) Session Middleware (if you need server-side sessions)
app.use(
  session({
    secret: process.env.JWT_SECRET, // Use existing JWT_SECRET instead of undefined SESSION_SECRET
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Changed from MONGODB_URI to MONGO_URI
      collectionName: 'sessions',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* 
   IMPORTANT: We REMOVE the global token middleware that tries to 
   verify "Bearer <token>" incorrectly. We'll rely on your route-based 
   middleware in userRoute.js => authMiddleware for /me and others.
   (If you want a global approach, you'd have to properly parse 
   the Bearer token. But for now, let's keep it simple and let 
   your route do the token check.)
*/

// API routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api', ipTrackingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/brand', brandRouter);
app.use('/api/subscriptions', subscriptionRoute);

// Static files - your frontend apps
if (process.env.NODE_ENV === 'production') {
  // Serve frontend
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  // Serve admin panel
  app.use('/admin', express.static(path.join(__dirname, 'admin/dist')));

  // Handle admin routes
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
  });

  // Handle frontend routes
  app.get(/^(?!\/api|\/admin).+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });

  // Handle product links for the frontend
  app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Serve uploads if needed
app.use('/uploads', express.static('uploads'));

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
