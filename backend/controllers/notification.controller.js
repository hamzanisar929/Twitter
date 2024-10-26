import NewNotification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userNotifications = await NewNotification.find({
      to: userId,
    }).populate({
      path: "from",
      select: "username profileImg",
    });
    await NewNotification.updateMany({ to: userId }, { read: true });
    if (!userNotifications) {
      return res.status(200).json({ message: "You have 0 notifications" });
    }
    res.status(200).json({ userNotifications });
  } catch (err) {
    console.log(
      "Error in Notification controller get all notifications",
      err.message
    );
    res.status(404).json({ error: "Internal Server error" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await NewNotification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (err) {
    console.log(
      "Error in Notification controller delete all notifications",
      err.message
    );
    res.status(404).json({ error: "Internal Server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifId = req.params.id;

    await NewNotification.deleteOne({ to: userId, _id: notifId });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.log(
      "Error in Notification controller delete a notification",
      err.message
    );
    res.status(500).json({ error: "Internal Server error" });
  }
};
