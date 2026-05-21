import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) return cached.conn;

    const MONGO_URI = process.env.URI;

    if (!MONGO_URI) {
        throw new Error("Please define MONGO_URI (check process.env.URI)");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
            dbName: 'HelpBot',
            bufferCommands: false,
        }).then((mongoose) => {
            console.log("Connected to MongoDB", mongoose.connection.name);
            return mongoose;
        }).catch((err) => {
            console.error("MongoDB connection error:", err);
            cached.promise = null; // Clear promise to allow retries
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}