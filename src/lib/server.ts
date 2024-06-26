import { Connection, MessageInfo } from "./network";

export class Server {
    conn: Connection | undefined;
    selected_channel_uuid: number | undefined = undefined;
    messages: MessageInfo[] = [];
    ip: string;
    port: number;

    constructor(conn: Connection | [string, number]) {
        if (conn instanceof Connection) {
            this.conn = conn;
            this.ip = conn.ip;
            this.port = conn.port;
        } else {
            [this.ip, this.port] = conn;
        }
    }
}
