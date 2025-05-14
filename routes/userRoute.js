// userRoute.js
import express from 'express';
import {
    loginUser,
    registerUser,
    adminLogin,
    getUserProfile,
    getAllUsers,
    verifyToken // Add this import
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// Add verify route
userRouter.get('/verify', authMiddleware, verifyToken);

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.get('/me', authMiddleware, getUserProfile);
userRouter.get('/all', authMiddleware, getAllUsers);

export default userRouter;
