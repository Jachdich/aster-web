import { Connection, MessageInfo } from "./network";

export class Server {
    conn: Connection;
    selected_channel_uuid: number | undefined = undefined;
    messages: MessageInfo[] = [];
    constructor(conn: Connection) {
        this.conn = conn;
    }
}
