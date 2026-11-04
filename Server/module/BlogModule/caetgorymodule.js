// import mongoose from "mongoose";
const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    
  },
  { timestamps: true },
);

categorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("BlogCategory", categorySchema);
