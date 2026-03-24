# Realtime Chat Application

A full-featured realtime chat application with authentication, chat rooms, and instant messaging.

## Features

- User authentication (signup/signin)
- Create and join chat rooms
- Realtime messaging with Socket.io
- Modern UI with Tailwind CSS
- State management with Zustand

## Setup

### Backend

1. Navigate to Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install socket.io-client
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open http://localhost:5173 in your browser
2. Sign up for a new account or sign in
3. Create a chat room or join existing ones
4. Start chatting in realtime!

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### User
- `GET /api/user/me` - Get current user info

### Chat
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms` - Get user's chat rooms
- `GET /api/chat/rooms/:roomId/messages` - Get messages in room
- `POST /api/chat/messages` - Send message

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Socket.io, JWT
- **Frontend**: React, TypeScript, Tailwind CSS, Zustand, Axios