import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

async function seedTestUser() {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://yarmaciercanyasin:r4mq6uNgzIPev856@cluster0.1woykrh.mongodb.net/locamoo?retryWrites=true&w=majority';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('locamoo');

        // Create test user
        const hashedPassword = await bcrypt.hash('Test123!@#', 12);
        const testUser = {
            email: 'test@example.com',
            password: hashedPassword,
            username: 'testuser',
            passkey: '123456',
            createdAt: new Date(),
            status: 'online',
            photoUrl: '/default-avatar.png',
            level: 1
        };

        await db.collection('users').insertOne(testUser);
        console.log('Test user created successfully');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

seedTestUser();
