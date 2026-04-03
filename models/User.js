import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// --- FIX YAHAN HAI ---
// Async function use karte waqt 'next' ki zaroorat nahi hoti
userSchema.pre("save", async function () {
  // 1. Agar password change nahi hua toh hashing skip karein
  if (!this.isModified("password")) return;

  try {
    // 2. Password Hash karein
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Jab async function finish hota hai, Mongoose apne aap save process continue karta hai
  } catch (error) {
    // 3. Error throw karein, ye automatically 'catch' block mein jayega
    throw new Error(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;