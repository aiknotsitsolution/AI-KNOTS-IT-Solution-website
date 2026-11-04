
// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     title: { type: String }, // Better to have both for blog
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "BlogCategory",
//       required: true,
//     },
//     author: { type: String, default: "Anonymous" },
//     description: { type: String, required: true },
//     content: { type: String }, // Full rich content (HTML)
//     images: [{ type: String, required: true }],

//     // Engagement Fields
//     views: { type: Number, default: 0 },
//     likes: { type: Number, default: 0 },
//     likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopUser" }],

//     comments: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "PopUser" },
//         comment: { type: String, required: true },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },           // ← Main title for display
    slug: { 
      type: String, 
      unique: true, 
      lowercase: true,
      trim: true 
    },                                                 // ← Important for SEO & URLs

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    author: { type: String, default: "Anonymous" },
    description: { type: String, required: true },
    content: { type: String }, 

    images: [{ type: String, required: true }],

    // Engagement
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopUser" }],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "PopUser" },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for faster slug search
productSchema.index({ slug: 1 });
productSchema.index({ createdAt: -1, _id: -1 });
productSchema.index({ category: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model("Product", productSchema);