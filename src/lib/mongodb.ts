import mongoose from "mongoose";
const { MONGODB_URI } = process.env;
let connection: typeof mongoose.connection;
export const connectDB = async () => {
  if (connection?.readyState === 1) {
    console.log("Connected to MongoDB");
    return Promise.resolve(true);
  }
  try {
    const mongooseInstance = await mongoose.connect(MONGODB_URI as string);
    connection = mongooseInstance.connection;
    if (connection?.readyState === 1) {
      console.log("Connected to MongoDB");
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw new Error("Network Connection Error");
  }
};
