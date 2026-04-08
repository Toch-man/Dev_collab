const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["invite", "task", "message"] },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamp: true }
);

module.export = mongoose.model("Notification", notificationSchema);
