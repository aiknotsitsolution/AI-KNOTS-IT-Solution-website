
// const mongoose = require("mongoose");
// const techSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "techCategory",
//       required: true,
//     },
//     images: [{ type: String, required: true }],
//     views: { type: Number, default: 0 },
//         likes: { type: Number, default: 0 },
//         likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopUser" }],
    
//         comments: [
//           {
//             user: { type: String, default: "Anonymous" },
//             email: { type: String },
//             comment: { type: String, required: true },
//             createdAt: { type: Date, default: Date.now },
//           },
//         ],
//   },
  
//   { timestamps: true },
// );

// module.exports = mongoose.model("Technology", techSchema);

// const mongoose = require("mongoose");
// const slugify = require("slugify");

// const techSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,           // For faster queries
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "techCategory",
//       required: true,
//     },

//     images: {
//       type: [String],
//       required: true,
//       validate: {
//         validator: (arr) => arr.length > 0,
//         message: "At least one image is required",
//       },
//     },

//     views: {
//       type: Number,
//       default: 0,
//     },

//     likes: {
//       type: Number,
//       default: 0,
//     },

//     likedBy: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "PopUser",
//       },
//     ],

//     comments: [
//       {
//         user: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "PopUser",        // Better to reference user
//           default: null,
//         },
//         name: {                  // For display when user not logged in
//           type: String,
//           default: "Anonymous",
//         },
//         email: {
//           type: String,
//           lowercase: true,
//           trim: true,
//         },
//         comment: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // ====================
// // AUTO GENERATE SLUG
// // ====================
// techSchema.pre("save", async function (next) {
//   if (this.isModified("title") || !this.slug) {
//     let baseSlug = slugify(this.title, {
//       lower: true,
//       strict: true,
//       trim: true,
//     });

//     if (!baseSlug) baseSlug = `tech-${Date.now()}`;

//     let slug = baseSlug;
//     let counter = 1;

//     // Check for uniqueness
//     while (true) {
//       const existing = await mongoose.models.Technology.findOne({ slug });
//       if (!existing || existing._id.toString() === this._id.toString()) {
//         break;
//       }
//       slug = `${baseSlug}-${counter}`;
//       counter++;
//     }

//     this.slug = slug;
//   }
//   next();
// });

// // Optional: Index for better performance
// techSchema.index({ slug: 1 });
// techSchema.index({ category: 1, createdAt: -1 });

// module.exports = mongoose.model("Technology", techSchema);

const mongoose = require("mongoose");
const slugify = require("slugify");

const techSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "techCategory",
      required: true,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one image is required",
      },
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PopUser",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PopUser",
          default: null,
        },
        name: {
          type: String,
          default: "Anonymous",
        },
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// ====================
// AUTO GENERATE SLUG (Without next())
// ====================
techSchema.pre("save", async function () {
  if (this.isModified("title") || !this.slug) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!baseSlug) baseSlug = `tech-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;

    // Check for uniqueness
    while (true) {
      const existing = await mongoose.models.Technology.findOne({ slug });

      if (!existing || existing._id.toString() === this._id?.toString()) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

// Indexes for better performance
techSchema.index({ slug: 1 });
techSchema.index({ category: 1, createdAt: -1 });
techSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Technology", techSchema);