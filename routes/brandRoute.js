import express from 'express';
import multer from 'multer';
import { 
    addBrand, 
    listBrands, 
    updateBrand, 
    deleteBrand,
    bringToTop
} from '../controllers/brandController.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Brand routes
router.post('/add', upload.single('logo'), addBrand);
router.get('/list', listBrands);
router.post('/update', upload.single('logo'), updateBrand);
router.delete('/delete', deleteBrand);
router.post('/bring-to-top', bringToTop);

export default router;