const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'public/uploads/images')
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

module.exports = { upload };