const multer = require('multer');

// For adding products
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'public/uploads/products')
    },
    filename:(req,file,cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');     
        cb(null, Date.now() + fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize:  25 * 1024 * 1024  }
})

// For uploading schedule images
const schedStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'public/uploads/schedule')
    },
    filename:(req,file,cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');     
        cb(null, Date.now() + fileName);
    }
});

const schedUpload = multer({
    storage: schedStorage,
    limits: { fileSize:  25 * 1024 * 1024  }
})

// For uploading profile pictures
const profilePicStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'public/uploads/profilePics')
    },
    filename:(req,file,cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');     
        cb(null, Date.now() + fileName);
    }
})

const profilePicUpload = multer({
    storage: profilePicStorage,
    limits: { fileSize: 25 * 1024 * 1024 }
})

module.exports = { upload,schedUpload,profilePicUpload };