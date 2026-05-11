const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema(
  {
    // Link to the user who created this doubt
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    question: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    subject: {
      type: String,
      trim: true,
      default: "General",
    },

    answer: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    tags: [{
      type: String,
    }],

    isHelpful: {
      type: Boolean,
      default: null,
    },

    followUps: [
      {
        question: { type: String },
        answer: { type: String },
        askedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doubt", doubtSchema);