import { Connection, MessageInfo, can_notify } from "./network";

export class Server {
    conn: Connection;
    selected_channel_uuid: number | undefined = undefined;
    messages: MessageInfo[] = [];
    requesting_history_from: number[] = [];
    constructor(conn: Connection) {
        console.log(conn);
        this.conn = conn;
        this.conn.handle_notify = (msg) => this.handle_notify(msg);
    }

    handle_notify(message: MessageInfo) {
        if (
            can_notify &&
            message.author.uuid != this.conn.my_uuid &&
            (!document.hasFocus() ||
                message.channel_uuid != this.selected_channel_uuid)
        ) {
            new Notification(
                `${this.conn.name} #${this.conn.get_channel(message.channel_uuid)?.name}`,
                { body: `${message.author.display_name}: ${message.content}` },
            );
        }
    }
}
