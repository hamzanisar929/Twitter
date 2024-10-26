import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getUserPosts,
  getFollowingPosts,
  getLikedPosts,
  getAllPosts,
  likeUnlikePost,
  commentPost,
  deletePost,
  createPost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/all", getAllPosts);
router.get("/following", getFollowingPosts);
router.get("/user/:username", getUserPosts);
router.get("/likes/:id", getLikedPosts);
router.post("/create", createPost);
router.post("/like/:id", likeUnlikePost);
router.post("/comment/:id", commentPost);
router.delete("/:id", deletePost);

export default router;
