import { MongoClient } from 'mongodb';

async function updateUserStatus() {
    const uri = 'mongodb://127.0.0.1:27017/locamoodb';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('locamoodb');

        const result = await db.collection('users').updateMany(
            {},
            { $set: { status: 'online', lastStatusUpdate: new Date() } }
        );

        console.log(`Updated ${result.modifiedCount} users`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
        process.exit();
    }
}

updateUserStatus();
