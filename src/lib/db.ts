import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

declare global {
  /* eslint-disable-next-line no-var */
  var mongooseGlobal: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cachedMongoose = global.mongooseGlobal

if (!cachedMongoose) {
  cachedMongoose = global.mongooseGlobal = { conn: null, promise: null };
}

export async function connectDB() {
  if (cachedMongoose.conn) return cachedMongoose.conn;

  if (!cachedMongoose.promise) {
    cachedMongoose.promise = mongoose.connect(MONGODB_URI)
  }

  cachedMongoose.conn = await cachedMongoose.promise;
  return cachedMongoose.conn;
}