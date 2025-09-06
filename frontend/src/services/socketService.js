// src/services/socket.service.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL;

// autoConnect: false -> we connect after we know the user id
const socket = io(SOCKET_URL, { withCredentials: true,
  transports:["websocket","pooling"],
  reconnectionAttempts:5,
  autoConnect: false });

const connect = (userId) => {
  if (!userId) return;
  if (!socket.connected) socket.connect();
  socket.emit("user_connection", userId);
};

const disconnect = () => {
  if (socket.connected) socket.disconnect();
};

const on = (event, cb) => socket.on(event, cb);
const off = (event, cb) => socket.off(event, cb);
const emit = (event, payload) => socket.emit(event, payload);

export default { socket, connect, disconnect, on, off, emit };
