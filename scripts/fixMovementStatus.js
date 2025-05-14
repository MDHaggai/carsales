import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Order from '../models/orderModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixMovementStatuses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Specify the order ID you want to update
    const orderIdToUpdate = '67d9d8c6bfbc8b5412a84e0c';
    
    console.log(`\nUpdating specific order: ${orderIdToUpdate}`);
    
    // Update specific order
    const updateResult = await Order.findByIdAndUpdate(
      orderIdToUpdate,
      { 
        $set: { 
          'shipping.movementStatus': 'on_transit',
          'shipping.timeTracking.startedAt': new Date(),
          'shipping.progress': 0
        } 
      },
      { new: true }
    );

    if (updateResult) {
      console.log('\nSuccessfully updated order:');
      console.log(`Order ${updateResult._id}:`);
      console.log('New movement status:', updateResult.shipping?.movementStatus);
      console.log('Started at:', updateResult.shipping?.timeTracking?.startedAt);
      console.log('Progress:', updateResult.shipping?.progress);
    } else {
      console.log('\nOrder not found');
    }

    // Verify all orders status
    const allOrders = await Order.find(
      { 'shipping.movementStatus': { $exists: true } },
      { 
        'shipping.movementStatus': 1,
        'shipping.timeTracking.startedAt': 1,
        'shipping.progress': 1
      }
    );

    console.log('\nAll orders status after update:');
    allOrders.forEach(order => {
      console.log(`Order ${order._id}:`);
      console.log('- Movement status:', order.shipping?.movementStatus);
      console.log('- Started at:', order.shipping?.timeTracking?.startedAt);
      console.log('- Progress:', order.shipping?.progress);
      console.log('---');
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing movement statuses:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

fixMovementStatuses();