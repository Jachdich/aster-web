import type { Connection, MessageInfo } from "./network";

export class Server {
    conn: Connection;
    selected_channel_uuid: number | null = null;
    messages: MessageInfo[] = [];
    call_on_message: (() => void) | null = null;
    
    constructor(conn: Connection) {
        console.log("constructed with conn:", conn);
        this.conn = conn;
        this.conn.message_callback = (message) => this.on_message(message);
    }
    
    on_message(message: MessageInfo) {
        console.log("we have this", this)
        console.log("Got message from server " + this.conn.port.toString(), message);
        if (message.channel_uuid == this.selected_channel_uuid) {
            this.messages.push(message);
            this.messages = this.messages;
        }
        if (this.call_on_message !== null) { this.call_on_message(); }
    }
}
