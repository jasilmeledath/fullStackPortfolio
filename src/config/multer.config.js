const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const baseDir = path.join(__dirname, '..', 'public', 'uploads');
    const subDirs = ['profile', 'projects', 'badges', 'blogs'];
    
    // Create base uploads directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Create subdirectories
    subDirs.forEach(dir => {
        const dirPath = path.join(baseDir, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
};

// Create directories on module load
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = path.join(__dirname, '..', 'public', 'uploads');
        
        // Determine subdirectory based on file type
        if (file.fieldname === 'logoIcon' || file.fieldname === 'avatar') {
            uploadPath = path.join(uploadPath, 'profile');
        } else if (file.fieldname === 'coverImage') {
            uploadPath = path.join(uploadPath, 'projects');
        } else if (file.fieldname === 'badgeIcon' || file.fieldname === 'iconUrl') {
            uploadPath = path.join(uploadPath, 'badges');
        } else if (file.fieldname === 'blogImage') {
            uploadPath = path.join(uploadPath, 'blogs');
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload; 