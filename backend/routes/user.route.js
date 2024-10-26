import express from "express";
import protectRoute from "../middleware/protectRoute.js";

import {
  updateUsers,
  getSuggestedUsers,
  followUnfollowUser,
  getUserProfile,
} from "../controllers/user.controller.js";
const router = express.Router();

router.use(protectRoute);
router.get("/profile/:username", getUserProfile);
router.post("/follow/:id", followUnfollowUser);
router.get("/suggested", getSuggestedUsers);
router.post("/update", updateUsers);

export default router;
