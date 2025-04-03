import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locamoo';

    const opts = {
        maxPoolSize: 10,
        connectTimeoutMS: 5000,  // Reduced from 10000
        socketTimeoutMS: 5000,   // Reduced from 10000
        serverSelectionTimeoutMS: 5000, // Added server selection timeout
    };

    try {
        const client = await MongoClient.connect(uri, opts);
        const db = client.db('locamoo');

        cachedClient = client;
        cachedDb = db;

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('Failed to connect to database');
    }
}
