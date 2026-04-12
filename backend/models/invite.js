const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inviteSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    // receiver: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    // },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamp: true }
);

module.export = mongoose.model("Invite", inviteSchema);
