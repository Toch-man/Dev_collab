const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = new Schema(
  {
    project: { type: String, ref: "Project", required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
      },
    ],
  },
  { timestamps: true }
);

module.export = mongoose.model("Team", teamSchema);
