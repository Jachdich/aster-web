import { Server } from "./server";

export let can_notify = false;
export const set_can_notify = (x: boolean) => { can_notify = x };

enum Status {
    Ok = 200,
    Forbidden = 403,
    NotFound = 404,
}

const MY_API_VERSION = [0, 2, 0];

export class ServerError {
    code: number;
    constructor(code: number) {
        this.code = code;
    }
}
export class ChannelNotFound { };
export class Forbidden { };

export class MessageInfo {
    content: string;
    author: Peer;
    date: Date;
    uuid: number;
    channel_uuid: number;
    constructor(content: string, author: Peer, date: Date, uuid: number, channel_uuid: number) {
        this.content = content;
        this.author = author;
        this.date = date;
        this.uuid = uuid;
        this.channel_uuid = channel_uuid;
    }
}

export class Peer {
    display_name: string;
    pfp: string;
    uuid: number;
    constructor(display_name: string, pfp: string, uuid: number) {
        this.display_name = display_name;
        this.pfp = pfp;
        this.uuid = uuid;
    }
    public static from(obj: any): Peer | undefined {
        if (obj.uuid !== undefined &&
            obj.name !== undefined &&
            obj.pfp !== undefined) {
            return new Peer(obj.name, obj.pfp, obj.uuid);
        }
        console.log("Invalid peer: ")
        console.log(obj);
        return undefined;
    }
}

export class Channel {
    uuid: number;
    name: string;
    cached_messages: Array<MessageInfo> = new Array();

    constructor(uuid: number, name: string) {
        this.uuid = uuid;
        this.name = name;
    }
    public static from(obj: any): Channel | undefined {
        if (obj.uuid !== undefined &&
            obj.name !== undefined) {
            return new Channel(obj.uuid, obj.name);
        }
        console.log("Invalid channel: ")
        console.log(obj);
        return undefined;
    }
}

class SyncServer {
    uuid: number | undefined;
    ip: string;
    port: number;
    idx: number;
    uname: string;
    pfp: string | undefined;
    name: string | undefined;
    constructor(
        uuid: number | undefined,
        ip: string,
        port: number,
        idx: number,
        uname: string,
        pfp: string | undefined,
        name: string | undefined
    ) {
        this.uuid = uuid;
        this.ip = ip;
        this.port = port;
        this.idx = idx;
        this.uname = uname;
        this.pfp = pfp;
        this.name = name;
    }
}

export class Connection {
    socket: WebSocket | undefined = undefined;
    my_uuid: number | undefined = undefined;
    name: string | undefined = undefined;
    pfp: string | undefined = undefined;
    known_peers: Map<number, Peer> = new Map();
    ip: string;
    port: number;
    username: string;
    password: string; // TODO is this a good idea?
    private waiting_for: Map<string, any> = new Map();
    cached_channels: Map<number, Channel> = new Map();
    logged_in: boolean = false;
    we_have_the_metadata_lads: boolean = false;
    we_have_the_channels_lads: boolean = false;
    got_name: boolean = false;
    got_icon: boolean = false;
    message_callback: undefined | ((_: MessageInfo) => void) = undefined;
    constructor(ip: string, port: number, uname: string, pword: string) {
        this.ip = ip;
        this.port = port;
        this.username = uname;
        this.password = pword;
    }

    public connect(auth: "Login" | "Register"): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
            } catch (e) {
                reject("Invalid server IP/port");
                return;
            }
            this.socket.addEventListener("error", (_) => {
                let err_msg = "Could not connect to server: Error in websocket. Is the server down?";
                console.log(err_msg);
                reject(err_msg);
            });
            this.socket.addEventListener("open", (_) => {
                this.socket?.send(JSON.stringify({ "command": auth.toLowerCase(), "uname": this.username, "passwd": this.password }));
            });
            this.socket.addEventListener("message", (event) => {
                console.log(event.data);
                let obj = JSON.parse(event.data);
                if (this.waiting_for.has(obj["command"])) {
                    this.waiting_for.get(obj["command"])(obj);
                    this.waiting_for.delete(obj["command"]);
                }

                if (obj["command"] == "login" && obj["status"] == Status.Forbidden) {
                    reject("Incorrect username or password! Try again.");
                } else if (obj["command"] == "login" && obj["status"] == Status.NotFound) {
                    reject("Unknown username");
                } else if (obj["status"] != Status.Ok) {
                    // err_msg = "Command '" + obj["command"] + "' failed with error code " + obj["status"];
                } else {
                    if (obj["command"] == "login" || obj["command"] == "register"){
                        this.my_uuid = obj["uuid"];
                        this.socket?.send(JSON.stringify({ "command": "get_metadata" }));
                        this.socket?.send(JSON.stringify({ "command": "list_channels" }));
                        this.socket?.send(JSON.stringify({ "command": "get_name" }));
                        this.socket?.send(JSON.stringify({ "command": "get_icon" }));
                        this.logged_in = true;
                    } else if (obj["command"] == "get_metadata") {
                        for (const peer_json of obj["data"]) {
                            const peer = Peer.from(peer_json);
                            if (peer !== undefined) {
                                this.known_peers.set(peer_json["uuid"], peer);
                            } else {
                                console.log("Peer json invalid froom " + this.ip + ":" + this.port);
                            }
                        }
                        this.we_have_the_metadata_lads = true;
                    } else if (obj["command"] == "list_channels") {
                        for (const channel_json of obj["data"]) {
                            const channel = Channel.from(channel_json);
                            if (channel !== undefined) {
                                this.cached_channels.set(channel.uuid, channel);
                            }
                        }
                        this.we_have_the_channels_lads = true;
                    } else if (obj["command"] == "content") {
                        const info = this.make_message(obj);
                        if (info !== undefined) {
                            if (this.message_callback !== undefined) {
                                this.message_callback(info);
                            }
                            let channel_uuid = obj["channel_uuid"];
                            let channel = this.get_channel(channel_uuid);
                            channel?.cached_messages.push(info);
                        }
                    } else if (obj["command"] == "API_version") {
                        // TODO make this function actually show an error
                        const remote_version = obj["version"];
                        if (remote_version[0] < MY_API_VERSION[0]) {
                            console.log("Server is too old!");
                        } else if (remote_version[0] > MY_API_VERSION[0]) {
                            console.log("Server is too new!");
                        } else {
                            // uhh we're ok
                        }
                    } else if (obj["command"] == "get_name") {
                        this.name = obj["data"];
                        this.got_name = true;
                    } else if (obj["command"] == "get_icon") {
                        this.pfp = obj["data"];
                        this.got_icon = true;
                    }
                    if (this.logged_in && this.we_have_the_metadata_lads && this.we_have_the_channels_lads && this.got_name && this.got_icon) {
                        resolve();
                    }
                }

            });
        });
    }

    private make_message(message: any): MessageInfo | undefined {
        const peer = this.known_peers.get(message["author_uuid"]);
        if (peer !== undefined) {
            return new MessageInfo(message["content"], peer, new Date(message["date"] * 1000), message["uuid"], message["channel_uuid"]);
        } else {
            console.log("Nonexistent peer: " + message["author_uuid"]);
        }
        return undefined;
    }

    public list_channels(): Channel[] {
        return Array.from(this.cached_channels.values());
    }

    public get_channel(uuid: number): Channel | undefined {
        return this.cached_channels.get(uuid);
    }

    public get_channel_by_name(name: string): Channel | undefined {
        for (const channel of this.cached_channels.values()) {
            if (channel.name == name) {
                return channel;
            }
        }
    }

    public async get_history(channel_uuid: number): Promise<Array<MessageInfo> | ChannelNotFound | Forbidden | ServerError> {
        const channel = this.get_channel(channel_uuid);
        if (channel === undefined) {
            return new ChannelNotFound();
        }
        if (channel.cached_messages.length < 100) {
            const history = await this.request({ "command": "history", "channel": channel_uuid, "num": 100 });
            if (history["status"] == Status.NotFound) {
                return new ChannelNotFound();
            } else if (history["status"] == Status.Forbidden) {
                return new Forbidden();
            } else if (history["status"] != Status.Ok) {
                return new ServerError(history["status"]);
            }
            let messages = new Array<MessageInfo>();
            let i = 0;
            for (const message of history["data"]) {
                let info = this.make_message(message);
                if (info !== undefined) {
                    messages[i] = info;
                    i++;
                }
            }
            channel.cached_messages = messages; // update cached - TODO: should this all be in the generic packet receiver function?
            return messages;
        } else {
            return channel.cached_messages;
        }
    }

    public request(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.socket === undefined) {
                reject("Not connected");
                return;
            }
            this.waiting_for.set(data["command"], (data: any) => resolve(data));
            this.socket.send(JSON.stringify(data));
        });
    }

    async update_sync_servers(servers: Server[]): Promise<Status> {
        let serialised_servers: SyncServer[] = [];
        let index: number = 0;
        for (const server of servers) {
            let uname = server.conn?.username || this.username;
            let name = server.conn?.name;
            let pfp = server.conn?.pfp;
            const sync_server = new SyncServer(server.conn?.my_uuid, server.conn.ip, server.conn.port, index++, uname, pfp, name);
            serialised_servers.push(sync_server);
        }
        console.log(servers);

        return (await this.request({ command: "sync_set_servers", servers: serialised_servers }))["status"];
    }
}
