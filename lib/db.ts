import mongoose from "mongoose";

// exclamation gives gurantee to TypeScript that the variable will not be null or undefined
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env file"
  );
}

// global.mongoose is used for cached connection because global variables persist across hot reloads in development.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  // conn: The actual connected instance.
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset the promise on error
    throw new Error(`MongoDB connection failed: ${(error as Error).message}`);
  }

  console.log(cached.conn);
  return cached.conn;
}
