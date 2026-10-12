const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "disabled"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
