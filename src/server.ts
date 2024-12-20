
import app from './app';
import { socket } from './socket';


app.listen(process.env.CLIENT_PORT, () => console.log(`Servidor rodando na porta ${process.env.CLIENT_PORT}`));
socket.listen(process.env.SOCKET_PORT, () => console.log(`Socket rodando na porta ${process.env.SOCKET_PORT}`));
