import { SocketEmitController } from "./app/controllers/SocketEmitController";


const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const app = express();
require('dotenv').config();

// const SOCKET_CONNECTION = `${process.env.CLIENT_CONNECTION}`;

const SOCKET_CONNECTION = '*';

app.use(
  cors({
      origin: SOCKET_CONNECTION,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      optionsSuccessStatus: 204,
  })
);

const socket = http.createServer(app);

const io = new Server(socket, {
    cors: {
        origin: SOCKET_CONNECTION,
        credentials: true,
    },
});

const ioSocket = SocketEmitController(io)


export { socket, io, ioSocket };
