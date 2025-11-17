import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import { generateCode } from "./utils/generateCode.js";
import { createRoom, joinRoom, getRoom, removeRoom } from "./rooms.js";

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Host creates a room
    socket.on("create-room", () => {
        const code = generateCode();
        createRoom(code, socket.id);
        socket.join(code);
        socket.emit("room-created", code);
        console.log("Room created:", code);
    });

    // Listener joins a room
    socket.on("join-room", (code) => {
        const ok = joinRoom(code, socket.id);
        if (!ok) {
            socket.emit("join-failed");
            return;
        }

        socket.join(code);
        socket.emit("join-success");
        io.to(getRoom(code).host).emit("listener-joined", socket.id);
        console.log("Listener joined room:", code);
    });

    // WebRTC: Sender → Server → Receiver
    socket.on("offer", ({ to, offer }) => {
        io.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }) => {
        io.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });

    socket.on("close-room", (code) => {
        io.to(code).emit("room-closed");
    });

});

app.get("/", (req, res) => {
    res.send("AudioParty signaling server running.");
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

