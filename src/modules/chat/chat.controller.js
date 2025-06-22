import {  Router } from "express";
import * as chatService from "./service/chat.service.js"
import { authentication } from "../../middleware/auth.middlware.js";
const router = Router()

router.get("/:friendId", authentication(), chatService.getChat)

export default router