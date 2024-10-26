import User from "./../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import NewNotification from "../models/notification.model.js";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username }).select("-password");
    console.log(username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.log("Error in user controller getuser profile", err.message);
    res.status(404).json({ error: err.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can not follow/unfollow yourself!" });
    }

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "No user found!" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // const newNotification = new NewNotification({
      //   type: "follow",
      //   from: req.user._id,
      //   to: id,
      // });
      // await newNotification.save();
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      //follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const newNotification = new NewNotification({
        type: "follow",
        from: req.user._id,
        to: id,
      });
      await newNotification.save();
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    console.log("Error in user controller follow unfollow user", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const id = req.user._id;
    const userFollowedByMe = await User.findById(id).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: id },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filterUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(req.user._id)
    );
    const suggestedUsers = filterUsers.slice(0, 4);
    suggestedUsers.forEach((user) => {
      user.password = null;
    });
    res.status(200).json({ suggestedUsers });
  } catch (err) {
    console.log("Error in user controller Get Suggested User", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profileImg, coverImg } = req.body;

    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please enter both current and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatched = await bcrypt.compare(currentPassword, user.password);
      if (!isMatched) {
        return res
          .status(404)
          .json({ error: "Please provide the correct current Password!" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password should be greater than 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      //if userProfile already exists
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();

    user.password = null;

    return res.status(200).json({ user });
  } catch (err) {
    console.log("Error in user controller updateUsers", err.message);
    res.status(500).json({ error: err.message });
  }
};
