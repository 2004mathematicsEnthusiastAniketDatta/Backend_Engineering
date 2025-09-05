import { Server } from "socket.io";
import redis from "ioredis";


class SocketService {
  private _io: Server;

  constructor() {
    console.log("Initializing SocketService");
    this._io = new Server(
      {
        cors:{
          allowedHeaders:['*'],
          origin:"*",
          methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD","CONNECT","TRACE"]
        }
      }
    );
  }

  public initListeners() {
    const io = this.io;
    console.log("Initializing Socket Listeners...");
    
    io.on("connect", (socket) => {
      console.log("New client connected", socket.id);
      socket.on('event:message', async ({message}: {message:string}) => {
        console.log('New Message received:', message);
        // Handle the message event

      });
    });
  }
  get io() {
    return this._io;
  }
}

export default SocketService;
