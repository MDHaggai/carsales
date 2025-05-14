import mongoose from 'mongoose';

const CollectionViewSchema = new mongoose.Schema({
    userIp: { type: String, required: true },
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const CollectionView = mongoose.model('CollectionView', CollectionViewSchema);

export default CollectionView;
