import mongoose from "mongoose";

// create mongodb schema with mongoose
const newNotificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// create model
const NewNotification = mongoose.model(
  "NewNotification",
  newNotificationSchema
);
export default NewNotification;
