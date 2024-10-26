import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  deleteNotification,
  deleteAllNotifications,
  getAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getAllNotifications);
router.delete("/", deleteAllNotifications);
router.delete("/:id", deleteNotification);
export default router;
