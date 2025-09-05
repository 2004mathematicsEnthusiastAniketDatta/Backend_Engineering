import * as http from "http";
declare class SocketService {
    private _io;
    constructor(server: http.Server);
    private initialize;
    emitEvent(event: string, data: any): void;
}
export default SocketService;
//# sourceMappingURL=socket.d.ts.map