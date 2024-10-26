import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import protectRoute from "./../middleware/protectRoute.js";

const router = express.Router();

router.get("/getMe", protectRoute, getMe);
router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", logout);

router;
export default router;
