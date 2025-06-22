import mongoose from "mongoose";
import logger from "../utils/logger/logger.js";

const DBconnection = () => {
    mongoose.connect(process.env.DB_URI, {
        serverSelectionTimeoutMS: 5000
    }).then(res => {
        logger.info(`DB connected successfully 🟢`)
    }).catch(err => {
        logger.error(`Fail to connect to DB server 🔴`)
    })
}

export default DBconnection