import http from 'http';
import SocketService from './services/socket.js';
async function init(){
    const httpServer = http.createServer();
    const socketService = new SocketService();
    const PORT = process.env.PORT ? process.env.PORT : 8050;
    socketService.io.attach(httpServer);
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
socketService.initListeners();
}
init();
