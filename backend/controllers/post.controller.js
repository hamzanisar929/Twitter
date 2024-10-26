import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import NewNotification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { photo } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "No user found!" });
    }
    if (!text && !photo) {
      return res
        .status(400)
        .json({ error: "Please provide either text or photo" });
    }
    if (photo) {
      const uploadedResponse = await cloudinary.uploader.upload(photo);
      photo = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      photo,
    });

    await newPost.save();

    res.status(200).json({ newPost });
  } catch (err) {
    console.log("Error in post controller createPost", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    if (!post) {
      res.status(400).json({ error: "No post Found!" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      res
        .status(400)
        .json({ error: "You are not authorized to delete this post" });
    }
    if (post.photo) {
      const photoId = post.photo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(photoId);
    }
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (err) {
    console.log("Error in post controller deletePost", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(500).json({ error: "Test feild is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(500).json({ error: "Post not found!" });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    res.status(200).json({ post });
  } catch (err) {
    console.log("Error in post controller commentPost", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      // UnLike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else if (!isLiked) {
      //Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const newNotification = new NewNotification({
        type: "like",
        from: userId,
        to: post.user,
      });
      await newNotification.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (err) {
    console.log("Error in post controller like Unlike Post", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!posts) {
      return res.status(200).json({ error: "No posts found!" });
    }
    res.status(200).json({ posts });
  } catch (err) {
    console.log("Error in post controller getAllPosts", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ error: "User not found!" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json({ likedPosts });
  } catch (err) {
    console.log("Error in post controller getLikedPosts", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "No user found!" });
    }

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json({ feedPosts });
  } catch (err) {
    console.log("Error in post controller getFollowingPosts", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const userPosts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (!userPosts) {
      return res.status(404).json({ error: "You have no posts yet!" });
    }

    res.status(200).json({ userPosts });
  } catch (err) {
    console.log("Error in post controller getUserPosts", err.message);
    res.status(500).json({ error: err.message });
  }
};
