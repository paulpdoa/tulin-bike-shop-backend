const multer = require('multer');

const storage = multer.diskStorage({
    destination: (request,file,callback) => {
        callback(null,'../uploads/images')
    },
    filename:(request,file,callback) => {
        callback(null, Date.now() + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024*1024*3
    }
})

module.exports = { upload };