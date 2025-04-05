import { WebSocket, WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';

const PORT = process.env.PORT || 3001;
const WS_URL = 'wss://locamoo.onrender.com';
const wss = new WebSocketServer({ port: Number(PORT) });

// Simplified MongoDB connection options
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!, {
    ssl: true,
    tls: true,
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
});

interface QueuePlayer {
    ws: WebSocket;
    username: string;
}

type MessageData = {
    type: 'JOIN_QUEUE' | 'LEAVE_QUEUE' | 'CHAT_MESSAGE' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT' | 'GLOBAL_CHAT';
    username: string;
    message?: string;
    to?: string;
};

let matchmakingQueue: QueuePlayer[] = [];
let onlinePlayers = new Map<string, WebSocket>();
let hiddenWords: string[] = [];

async function updateHiddenWords() {
    try {
        const db = client.db('locamoo');
        const words = await db.collection('hiddenWords')
            .find({})
            .toArray();
        hiddenWords = words.map(w => w.word.toLowerCase());
    } catch (error) {
        console.error('Failed to update hidden words:', error);
    }
}

// Call this periodically or when words are updated
setInterval(updateHiddenWords, 60000);
updateHiddenWords();

function filterMessage(message: string): string {
    let filtered = message.toLowerCase();
    hiddenWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
}

// Add cleanup interval (20 minutes in milliseconds)
const MESSAGE_RETENTION_TIME = 20 * 60 * 1000;

// Add this function after existing functions
async function cleanupOldMessages() {
    try {
        const db = client.db('locamoo');
        const twentyMinutesAgo = new Date(Date.now() - MESSAGE_RETENTION_TIME);

        await db.collection('globalChat').deleteMany({
            timestamp: { $lt: twentyMinutesAgo }
        });
    } catch (error) {
        console.error('Failed to cleanup old messages:', error);
    }
}

async function init() {
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log('MongoDB connected successfully');
        console.log(`WebSocket server running on port ${PORT}`);

        const db = client.db('locamoo');

        wss.on('connection', (ws: WebSocket) => {
            console.log('New WebSocket connection');

            ws.addListener('message', async (messageData) => {
                try {
                    const data = JSON.parse(messageData.toString()) as MessageData;
                    console.log('Received message:', data);

                    // Early return if username is missing
                    if (!data.username) {
                        console.error('Missing username in message');
                        return;
                    }

                    switch (data.type) {
                        case 'JOIN_QUEUE': {
                            const player: QueuePlayer = { ws, username: data.username };
                            matchmakingQueue.push(player);
                            onlinePlayers.set(data.username, ws);
                            broadcastStats();
                            findMatch();
                            break;
                        }

                        case 'LEAVE_QUEUE': {
                            matchmakingQueue = matchmakingQueue.filter(p => p.username !== data.username);
                            onlinePlayers.delete(data.username);
                            broadcastStats();
                            break;
                        }

                        case 'CHAT_MESSAGE': {
                            if (data.to && data.message) {
                                const targetWs = onlinePlayers.get(data.to);
                                if (targetWs) {
                                    targetWs.send(JSON.stringify({
                                        type: 'CHAT_MESSAGE',
                                        from: data.username,
                                        message: data.message,
                                        timestamp: new Date().toISOString()
                                    }));
                                }
                            }
                            break;
                        }

                        case 'FRIEND_REQUEST':
                            if (data.to) {
                                const targetWs = onlinePlayers.get(data.to);
                                if (targetWs) {
                                    targetWs.send(JSON.stringify({
                                        type: 'NOTIFICATION',
                                        notificationType: 'FRIEND_REQUEST',
                                        from: data.username
                                    }));
                                }
                            }
                            break;

                        case 'FRIEND_ACCEPT':
                            if (data.to) {
                                const targetWs = onlinePlayers.get(data.to);
                                if (targetWs) {
                                    targetWs.send(JSON.stringify({
                                        type: 'NOTIFICATION',
                                        notificationType: 'FRIEND_ACCEPTED',
                                        from: data.username
                                    }));
                                }
                            }
                            break;

                        case 'GLOBAL_CHAT': {
                            if (!data.message) {
                                console.error('Missing message in GLOBAL_CHAT');
                                return;
                            }

                            const user = await db.collection('users').findOne(
                                { username: data.username },
                                { projection: { photoUrl: 1, role: 1 } }
                            );

                            if (!user) {
                                console.error('User not found:', data.username);
                                return;
                            }

                            const timestamp = new Date();
                            const filteredMessage = filterMessage(data.message);

                            const messageData = {
                                username: data.username,
                                message: filteredMessage,
                                timestamp,
                                photoUrl: user.photoUrl,
                                role: user.role
                            };

                            // Save message to database
                            await db.collection('globalChat').insertOne(messageData);

                            const chatMessage = {
                                type: 'GLOBAL_CHAT',
                                message: messageData
                            };

                            // Broadcast to all connected clients
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify(chatMessage));
                                }
                            });
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });

            ws.addListener('close', () => {
                console.log('Client disconnected');
                matchmakingQueue = matchmakingQueue.filter(p => p.ws === ws);
                for (const [username, socket] of onlinePlayers.entries()) {
                    if (socket === ws) {
                        onlinePlayers.delete(username);
                        break;
                    }
                }
                broadcastStats();
            });

            // Send initial stats
            broadcastStats();
        });

    } catch (error) {
        console.error('Server initialization error:', error);
        // Add error details
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
    }
}

// Add cleanup interval after other intervals
setInterval(cleanupOldMessages, 60000); // Run every minute

function broadcastStats() {
    const stats = {
        type: 'STATS_UPDATE',
        onlinePlayers: onlinePlayers.size,
        inQueue: matchmakingQueue.length
    };

    for (const [_, ws] of onlinePlayers) {
        ws.send(JSON.stringify(stats));
    }
}

async function findMatch() {
    if (matchmakingQueue.length < 2) return;

    const player1 = matchmakingQueue.shift()!;
    const player2 = matchmakingQueue.shift()!;

    const db = client.db('locamoo');

    // Get player details
    const [player1Data, player2Data] = await Promise.all([
        db.collection('users').findOne({ username: player1.username }),
        db.collection('users').findOne({ username: player2.username })
    ]);

    // Send match found to both players
    player1.ws.send(JSON.stringify({
        type: 'MATCH_FOUND',
        opponent: {
            username: player2.username,
            photoUrl: player2Data?.photoUrl || '/default-avatar.png',
            level: player2Data?.level || 1
        }
    }));

    player2.ws.send(JSON.stringify({
        type: 'MATCH_FOUND',
        opponent: {
            username: player1.username,
            photoUrl: player1Data?.photoUrl || '/default-avatar.png',
            level: player1Data?.level || 1
        }
    }));
}

init().catch(console.error);
