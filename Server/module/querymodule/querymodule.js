// // import mongoose from "mongoose";
// const e = require("express");
// const mongoose = require("mongoose");
// const techSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     phone: { type: String, required: true },
//     email: { type: String, required: true },
//     message: { type: String, required: true, default: "No message provided" },
//     category: { type: String, enum: ["SEO", "BPO", "Software Developer", "Digital Marketing","Web Development","Other"], default: "Other"},
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Query", techSchema);


const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
    },
  },
  { timestamps: true }
);

querySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Query", querySchema);