import { MongoClient, Db, MongoServerSelectionError } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const ATLAS_URI = 'mongodb+srv://yarmaciercanyasin:r4mq6uNgzIPev856@cluster0.1woykrh.mongodb.net/locamoo?retryWrites=true&w=majority';

async function connectWithRetry(uri: string, opts: any, retries = 3): Promise<MongoClient> {
    try {
        return await MongoClient.connect(uri, opts);
    } catch (error) {
        if (retries > 0 && (error instanceof MongoServerSelectionError || (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'ECONNREFUSED'))) {
            console.log(`Retrying connection... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return connectWithRetry(uri, opts, retries - 1);
        }
        throw error;
    }
}

export async function getDb(): Promise<Db> {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGODB_URI || ATLAS_URI;

    const opts = {
        maxPoolSize: 10,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        retryWrites: true,
        w: 'majority'
    };

    try {
        const client = await connectWithRetry(uri, opts);
        const db = client.db('locamoo');

        cachedClient = client;
        cachedDb = db;

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Check if error is due to local connection
        if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
            console.log('Trying fallback to Atlas connection...');
            return getDb(); // Will use ATLAS_URI as fallback
        }
        throw new Error('Failed to connect to database');
    }
}
