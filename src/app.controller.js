import cors from "cors"
import path from "node:path"
import helmet from "helmet"

import DBconnection from "./DB/connection.js"
import authController from "./modules/auth/auth.controller.js"
import userController from "./modules/user/user.controller.js"
import postController from "./modules/post/post.controller.js" 
import chatController from "./modules/chat/chat.controller.js"

import { globalErrorHanling } from "./utils/response/error.response.js"

import { createHandler } from 'graphql-http/lib/use/express';
import playground from 'graphql-playground-middleware-express'
import { schema } from "./modules/app.graph.js"
import {rateLimit} from "express-rate-limit"




const postLimiter = rateLimit({
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    // max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const authLimiter = rateLimit({
    limit: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    // max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    standardHeaders : "draft-8",
    skipSuccessfulRequests : true
})

const bootstrap = (app, express) => {
    
    app.use(cors({origin: "*"}))
    app.use(helmet())
    app.use(express.json())

    app.use('/uploads',express.static(path.resolve("./src/uploads")))

    app.get('/graphql-playground', playground.default({ endpoint: '/graphql' }));
    app.all('/graphql', createHandler({ schema }));

    app.get('/', (req, res, next) => { return res.json({ message: "Welcome to Social App API V1" }) })
    app.use('/auth', authController)
    app.use('/user', userController)
    app.use('/post', postController)
    app.use('/chat', chatController)
    app.use('*', (req, res, next) => {
        return res.status(404).json({message : "In-vaild Routing"})
    })
    app.use(globalErrorHanling)
    DBconnection()
}

export default bootstrap