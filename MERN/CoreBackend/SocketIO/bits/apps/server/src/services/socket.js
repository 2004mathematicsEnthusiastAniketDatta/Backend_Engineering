import { Server } from "socket.io";
import * as http from "http";
class SocketService {
    _io;
    constructor(server) {
        this._io = new Server(server);
        this.initialize();
    }
    initialize() {
        this._io.on("connection", (socket) => {
            console.log("New client connected");
            socket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        });
    }
    emitEvent(event, data) {
        this._io.emit(event, data);
    }
}
export default SocketService;
//# sourceMappingURL=socket.js.map