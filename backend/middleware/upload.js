const multer = require("multer");

const storage = multer.memoryStorage();

// Allowed image types
const allowedMimeTypes = [
    "image/svg+xml",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/x-icon",
    "image/vnd.microsoft.icon"
];

// Validate uploaded file type
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid file type: ${file.mimetype}. Only SVG, PNG, JPEG, and WebP images are allowed.`
            ),
            false
        );
    }
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;