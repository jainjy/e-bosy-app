const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import cors

const app = express();
const server = http.createServer(app);

// Use CORS middleware
app.use(cors({
    origin: "http://localhost:5173", // Allow your React app to connect
    methods: ["GET", "POST"]
}));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Allow your React app to connect
        methods: ["GET", "POST"]
    }
});

// This object will store users in rooms.
// Key: roomName, Value: Set of socket IDs in that room
const rooms = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName); // Join the Socket.IO room

        if (!rooms.has(roomName)) {
            rooms.set(roomName, new Set());
        }
        rooms.get(roomName).add(socket.id);

        console.log(`${socket.id} joined room: ${roomName}`);

        // Notify others in the room that a new user has joined
        // `socket.to(roomName)` sends to all clients in the room except the sender
        socket.to(roomName).emit('userJoined', socket.id);

        // Send existing users in the room to the newly joined user
        const existingUsers = Array.from(rooms.get(roomName)).filter(id => id !== socket.id);
        socket.emit('existingUsersInRoom', existingUsers);
    });

    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName); // Leave the Socket.IO room
        if (rooms.has(roomName)) {
            rooms.get(roomName).delete(socket.id);
            if (rooms.get(roomName).size === 0) {
                rooms.delete(roomName);
            }
        }
        console.log(`${socket.id} left room: ${roomName}`);
        io.to(roomName).emit('userLeft', socket.id); // Notify everyone in the room
    });

    // WebRTC Signaling messages
    socket.on('sendOffer', (offer, targetSocketId) => {
        console.log(`Sending offer from ${socket.id} to ${targetSocketId}`);
        socket.to(targetSocketId).emit('receiveOffer', offer, socket.id);
    });

    socket.on('sendAnswer', (answer, targetSocketId) => {
        console.log(`Sending answer from ${socket.id} to ${targetSocketId}`);
        socket.to(targetSocketId).emit('receiveAnswer', answer, socket.id);
    });

    socket.on('sendIceCandidate', (candidate, targetSocketId) => {
        console.log(`Sending ICE candidate from ${socket.id} to ${targetSocketId}`);
        socket.to(targetSocketId).emit('receiveIceCandidate', candidate, socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find the room the user was in and remove them
        rooms.forEach((members, roomName) => {
            if (members.has(socket.id)) {
                members.delete(socket.id);
                if (members.size === 0) {
                    rooms.delete(roomName);
                }
                io.to(roomName).emit('userLeft', socket.id); // Notify others in that room
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Signaling server listening on port ${PORT}`);
});