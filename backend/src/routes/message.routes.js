import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getUserForSidebar,getMessages, SendMessage } from "../controllers/message.controllers.js";

const router = express.Router()

router.get("/users",protectRoute,getUserForSidebar)
router.get("/:id",protectRoute,getMessages)
router.post("/send/:id",protectRoute,SendMessage)

export default router;  