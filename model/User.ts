import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

// Hash the password before saving the user
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("Password NOT modified, skipping hashing.");
    return next();
  }
  if (!this.password) {
    console.log("No password provided, skipping hashing.");
    return next();
  }

  console.log("Before Hashing:", this.password); // Check if plain password is logged
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log("After Hashing:", this.password); // Check if password is hashed
  next();
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);