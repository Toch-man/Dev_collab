const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "under_review", "done"],
      default: "todo",
    },
    priority: { type: String, enum: ["low", "medium", "high"] },
    proof: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
