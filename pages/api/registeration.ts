import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";
import User from "../../model/User";
import bcrypt from "bcryptjs";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ❌ Remove Manual Hashing (Let Mongoose Model Handle It)
    const newUser = new User({ name, email, password });
    newUser.password = await bcrypt.hash(password, 10); // ✅ Manually hash password
    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        hashedPassword: newUser.password, // Check if it's hashed
      },
    });  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
