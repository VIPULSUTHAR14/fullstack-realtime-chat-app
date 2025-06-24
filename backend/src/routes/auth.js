import express from "express";
import { login , signup, logout,UpdateProfile , checkAuth } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

router.put("/profile",protectRoute,UpdateProfile)
router.get("/check",protectRoute,checkAuth)
export default router;