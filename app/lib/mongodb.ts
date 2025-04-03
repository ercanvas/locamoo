import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const ATLAS_URI = 'mongodb+srv://yarmaciercanyasin:r4mq6uNgzIPev856@cluster0.1woykrh.mongodb.net/locamoo?retryWrites=true&w=majority';

export async function getDb(): Promise<Db> {
    if (cachedDb) return cachedDb;

    try {
        const client = await MongoClient.connect(ATLAS_URI);
        const db = client.db('locamoo');

        cachedClient = client;
        cachedDb = db;

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
