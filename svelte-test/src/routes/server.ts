import type { Connection, MessageInfo } from "./network";

export class Server {
    conn: Connection;
    selected_channel_uuid: number | null = null;
    messages: MessageInfo[] = [];
    
    constructor(conn: Connection) {
        this.conn = conn;
        conn.message_callback = this.on_message;
    }
    
    on_message(message: MessageInfo) {
        console.log("Got message from server " + this.conn.port.toString());
        console.log(message);
        if (message.channel_uuid == this.selected_channel_uuid) {
            this.messages.push(message);
            this.messages = this.messages;
        }
    }
}
