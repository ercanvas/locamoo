import { WebSocket, WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';

const wss = new WebSocketServer({ port: 3001 });
const uri = process.env.MONGODB_URI || 'mongodb+srv://yarmaciercanyasin:r4mq6uNgzIPev856@cluster0.1woykrh.mongodb.net/locamoo?retryWrites=true&w=majority';
console.log('MongoDB URI:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
const client = new MongoClient(uri);

interface QueuePlayer {
    ws: WebSocket;
    username: string;
}

type MessageData = {
    type: 'JOIN_QUEUE' | 'LEAVE_QUEUE';
    username: string;
};

let matchmakingQueue: QueuePlayer[] = [];
let onlinePlayers = new Map<string, WebSocket>();

async function init() {
    try {
        await client.connect();
        console.log('MongoDB connected successfully');
        const db = client.db('locamoo');

        wss.on('connection', (ws: WebSocket) => {
            console.log('New WebSocket connection');

            ws.addListener('message', async (messageData) => {
                try {
                    const data: MessageData = JSON.parse(messageData.toString());
                    console.log('Received message:', data);

                    switch (data.type) {
                        case 'JOIN_QUEUE':
                            const player: QueuePlayer = { ws, username: data.username };
                            matchmakingQueue.push(player);
                            onlinePlayers.set(data.username, ws);
                            broadcastStats();
                            findMatch();
                            break;

                        case 'LEAVE_QUEUE':
                            matchmakingQueue = matchmakingQueue.filter(p => p.username !== data.username);
                            onlinePlayers.delete(data.username);
                            broadcastStats();
                            break;
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

        console.log('WebSocket server is running on port 3001');
    } catch (error) {
        console.error('Server initialization error:', error);
    }
}

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
