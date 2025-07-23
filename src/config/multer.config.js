const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories
const createUploadDirs = () => {
    const dirs = [
        'src/public/uploads/profile',
        'src/public/uploads/projects',
        'src/public/uploads/badges',
        'src/public/uploads/blogs'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Create directories on module load
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'src/public/uploads/';
        
        // Determine subdirectory based on field name
        if (file.fieldname === 'logoIcon') {
            uploadPath += 'profile/';
        } else if (file.fieldname === 'coverImage') {
            uploadPath += 'projects/';
        } else if (file.fieldname === 'badgeIcon') {
            uploadPath += 'badges/';
        } else if (file.fieldname === 'blogImage') {
            uploadPath += 'blogs/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
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
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
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