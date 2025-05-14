import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Save to 'uploads' directory
  },
  filename: function (req, file, cb) {
    const productId = req.body.productId || 'default';
    const ext = path.extname(file.originalname);
    cb(null, `${productId}-${Date.now()}${ext}`); // Include productId in the filename
  }
});

const upload = multer({ storage });

export default upload;
