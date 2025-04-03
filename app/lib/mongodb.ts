import { MongoClient, Db, MongoClientOptions, WriteConcern } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const connectWithRetry = async (uri: string, opts: MongoClientOptions): Promise<MongoClient> => {
    for (let i = 0; i < 3; i++) {
        try {
            const client = await MongoClient.connect(uri, opts);
            await client.db().command({ ping: 1 }); // Test connection
            return client;
        } catch (err) {
            if (i === 2) throw err; // Last retry, throw error
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
    }
    throw new Error('Failed to connect after retries');
};

export async function getDb(): Promise<Db> {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locamoo';

    const opts: MongoClientOptions = {
        maxPoolSize: 10,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        retryWrites: true,
        writeConcern: { w: 'majority' }
    };

    try {
        const client = await connectWithRetry(uri, opts);
        const db = client.db('locamoo');

        cachedClient = client;
        cachedDb = db;

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('Database connection failed');
    }
}
