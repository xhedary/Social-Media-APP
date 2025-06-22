import path from "node:path"
import express from "express"
import * as dotenv from "dotenv"
import bootstrap from "./src/app.controller.js"
dotenv.config({ path: path.resolve("./src/config/.env.dev") })


import { runIo } from "./src/modules/socket/socket.controller.js"
import logger from "./src/utils/logger/logger.js"
const app = express()
const PORT = process.env.PORT || 8000

bootstrap(app, express)
const httpServer = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server running on port ${PORT}`);

})


runIo(httpServer)