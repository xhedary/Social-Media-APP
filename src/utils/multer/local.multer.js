import multer from "multer";
import path from "node:path" 
import fs from "node:fs"
export const fileValidation = {
    image : ["image/jpeg", "image/png", "image/jpg"],
    document : ["application/pdf", "application/msword"]
}
export const uploadFileDisk = (customPath = "general", fileValidation =[]) => {
    const basePath = `uploads/${customPath}`
    const fullPath = path.resolve(`./src/${basePath}`)

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }
    const storage = multer.diskStorage({ 
        destination : (req, file, cb) => {
            cb(null, fullPath) 
        },
        filename : (req, file, cb) => {
            const finalfileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + file.originalname
            file.finalPath = basePath + "/" + finalfileName
            cb(null, finalfileName)
        }
    })

    function fileFilter  (req, file, cb) {
        if (fileValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb("Invalid file format", false)
        }
    }
    return multer({ dest: "tempPath" , fileFilter,  storage })
    
}