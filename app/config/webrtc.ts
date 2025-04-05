export const TURN_CONFIG = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        // Use Twilio's TURN service
        {
            urls: [
                'turn:global.turn.twilio.com:3478?transport=udp',
                'turn:global.turn.twilio.com:3478?transport=tcp'
            ],
            username: 'your_twilio_username',
            credential: 'your_twilio_credential'
        }
    ]
};
