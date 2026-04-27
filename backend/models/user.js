const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    full_name: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    skills: [{ type: String }],
    niche: { type: String, required: true },
    bio: { type: String },
    task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    refreshToken: { type: String, default: null },
    one_time_code: { type: String, default: null },
    reset_token: { type: String, default: null },
    reset_token_expires: { type: String, default: null },
    one_time_code_expires: { type: String, default: null },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);
