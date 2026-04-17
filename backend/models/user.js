const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    skills: [{ type: String }],
    bio: { type: String },
    task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);
