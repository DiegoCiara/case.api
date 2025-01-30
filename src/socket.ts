

import * as dotenv from 'dotenv';
import http from 'http'
import express from 'express';
import cors from 'cors';
import { Server} from 'socket.io';
import { SocketEmitController } from '@controllers/SocketEmitController';

const app = express();


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
