const UserModel = require("../models/user.model");

let ioInstance = null;

// Track online users
const onlineUsers = new Map();

const init = (io) => {

    if (ioInstance) return ioInstance

    ioInstance = io;

    ioInstance.on("connection", (socket) => {

        const userId = socket.handshake.auth?.userId

        if (!userId) {
            console.warn("[Socket] Connection rejected: Missing userId", {
                socketId: socket.id
            });
            return;
        }

        const room = userId.toString();

        socket.join(room);

        // store online user
        onlineUsers.set(room, socket.id);

        console.log("[Socket] User connected", {
            userId: room,
            socketId: socket.id
        });

   
        // OFFICER REAL-TIME LOCATION
        
        socket.on("officer:locationUpdate", async (data) => {

            try {

                const { latitude, longitude } = data;

                if (!latitude || !longitude) return;

                await UserModel.findByIdAndUpdate(
                    room,
                    {
                        currentLocation: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        }
                    },
                    { new: true }
                );

                console.log("[Socket] Officer location updated", {
                    officerId: room,
                    latitude,
                    longitude
                });

            } catch (err) {

                console.error("[Socket] Location update failed", {
                    officerId: room,
                    error: err.message
                });

            }

        });

     
        // Disconnect
      
        socket.on("disconnect", () => {

            onlineUsers.delete(room);

            console.log("[Socket] User disconnected", {
                userId: room,
                socketId: socket.id
            });

        });

    });

    return ioInstance;
};

const getIO = () => {

    if (!ioInstance) {
        throw new Error("Socket.io not initialized. Call init(io) first.");
    }

    return ioInstance;
};

const emitToUser = (userId, event, payload) => {

    if (!ioInstance) return;

    ioInstance.to(userId.toString()).emit(event, payload);

};

const isUserOnline = (userId) => {

    return onlineUsers.has(userId.toString());

};

module.exports = {
    init,
    getIO,
    emitToUser,
    isUserOnline
};