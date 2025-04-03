import { MongoClient } from 'mongodb';

declare global {
    var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locamoo';
console.log('MongoDB URI:', uri); // Debug log

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect()
        .then((client) => {
            console.log('MongoDB connected successfully');
            return client;
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error);
            throw error;
        });
}

clientPromise = global._mongoClientPromise;

export async function getDb() {
    const client = await clientPromise;
    return client.db('locamoo');
}

export default clientPromise;
