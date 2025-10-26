import mongoose from "mongoose";

// we’re telling TypeScript:

// “Hey, in this project, there will be a global variable named mongoose,
// and it will have two properties:
// conn: either a mongoose.Connection object or null
// promise: either a Promise that resolves to a mongoose.Connection, or null”
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

export {};
