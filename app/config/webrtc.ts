export const TURN_CONFIG = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            // You can use a service like Twilio's TURN servers
            // or set up your own TURN server using coturn
            urls: process.env.TURN_SERVER_URL || 'turn:your-turn-server.com:3478',
            username: process.env.TURN_SERVER_USERNAME || 'username',
            credential: process.env.TURN_SERVER_PASSWORD || 'password'
        }
    ]
};
