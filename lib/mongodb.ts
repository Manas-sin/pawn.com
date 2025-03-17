import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as any;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
          console.log("MongoDB already connected.");
          return;
        }
    
        await mongoose.connect(MONGODB_URI, {
          dbName: "your-db-name", // Ensure this is set correctly
        });
    
        console.log("✅ MongoDB Connected");
      } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
      }
};
