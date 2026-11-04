// import mongoose from "mongoose";
const mongoose = require("mongoose");
const techSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "recentworkCategory",
      required: true,
    },

    link: {
      type: String,
      required: true,
    },

    
    images: [{ type: String, required: true }],
  },
  { timestamps: true },
);

techSchema.index({ createdAt: -1 });

module.exports = mongoose.model("recentwork", techSchema);
