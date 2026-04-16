const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    project_name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    owner: { type: String, ref: "User", required: true },
    member: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: true },
    techStack: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
