import multer from "multer";

export const fileValidation = {
    image : ["image/jpeg", "image/png", "image/jpg"],
    document : ["application/pdf", "application/msword"]
}
export const uploadCloudFile = ( fileValidation =[]) => {

    const storage = multer.diskStorage({})

    function fileFilter  (req, file, cb) {
        if (fileValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb("Invalid file format", false)
        }
    }

    return multer({ dest: "tempPath" , fileFilter })
}