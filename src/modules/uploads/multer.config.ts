import multer from "multer";



const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

const upload = multer({ 
    storage : multer.memoryStorage(),

    limits: {
        fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      
        if(!acceptedImageTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
        }

        if(file.size > maxFileSize) {
            return cb(new Error("File size exceeds the limit of 5MB"));
        }

        return cb(null, true);

    }

});

export default upload;
