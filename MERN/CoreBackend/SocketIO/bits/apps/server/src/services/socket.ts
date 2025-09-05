import { Server } from "socket.io";
import { Redis } from "ioredis";
import Valkey from "iovalkey";
import { use } from "react";
const pub = new Valkey({
  host:"valkey-1871d165-aniketdatta-0152.d.aivencloud.com",
  port:16083,
  username:"default",
  password:"AVNS_1L2ywnxn2zRWaWJLGwb",
});
const sub = new Valkey({
  host:"valkey-1871d165-aniketdatta-0152.d.aivencloud.com",
  port:16083,
  username:"default",
  password:"AVNS_1L2ywnxn2zRWaWJLGwb",
});

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
    sub.subscribe("MESSAGES")
  }

  public initListeners() {
    const io = this.io;
    console.log("Initializing Socket Listeners...");
    
    io.on("connect", (socket) => {
      console.log("New client connected", socket.id);
      socket.on('event:message', async ({message}: {message:string}) => {
        console.log('New Message received:', message);
        // Handle the message event
        // Publish this message to Redis
      });
    });
  }
  get io() {
    return this._io;
  }
}

export default SocketService;
