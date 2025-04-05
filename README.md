# Locamoo

A real-time location-based multiplayer game platform built with Next.js, WebSocket, and MongoDB.

## Features

- 🎮 Multiple Game Modes:
  - Driving Time: Guess the travel time between two locations by car
  - Flight Time: Estimate air travel duration between cities
  - Weather Mode: Compare weather conditions between locations

- 👥 Social Features:
  - Global Chat with Voice Rooms
  - Private Messaging
  - Friend System
  - User Profiles
  - Premium Subscriptions

- 🛠️ Technical Features:
  - Real-time WebSocket Communication
  - WebRTC Voice Chat
  - MongoDB Integration
  - JWT Authentication
  - Mapbox Integration
  - Role-based Access Control (Admin/Moderator)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_WEBSOCKET_URL=your_websocket_url
TURN_SERVER_URL=your_turn_server_url
TURN_SERVER_USERNAME=your_username
TURN_SERVER_PASSWORD=your_password
```

3. Run the development server:
```bash
npm run dev     # Next.js frontend
npm run server  # WebSocket server
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Support

Run with Docker Compose:
```bash
docker-compose up
```

## Tech Stack

- Frontend: Next.js 14, React, TailwindCSS
- Backend: Node.js, WebSocket, MongoDB
- Voice Chat: WebRTC, TURN/STUN servers
- Maps: Mapbox GL JS
- Authentication: JWT, Bcrypt

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE) - See the license file for details.
