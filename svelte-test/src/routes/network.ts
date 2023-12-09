// import {browser} from '$app/environment';
const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;

export class MessageInfo {
    content: string;
    author: Peer;
    date: Date;
    uuid: number;
    constructor(content: string, author: Peer, date: Date, uuid: number) {
    	  this.content = content;
        this.author = author;
        this.date = date;
        this.uuid = uuid;
    }
}

export class Peer {
    display_name: string;
    pfp: string;
    uuid: string;
    constructor(display_name: string, pfp: string, uuid: string) {
        this.display_name = display_name;
        this.pfp = pfp;
        this.uuid = uuid;
    }
    public static from(obj: any): Peer | null {
        if (obj.uuid !== undefined &&
            obj.name !== undefined &&
            obj.pfp !== undefined) {
            return new Peer(obj.name, obj.pfp, obj.uuid);
        }
        console.log("Invalid peer: ")
        console.log(obj);
        return null;
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
    public static from(obj: any): Channel | null {
        if (obj.uuid !== undefined &&
            obj.name !== undefined) {
            return new Channel(obj.uuid, obj.name);
        }
        console.log("Invalid channel: ")
        console.log(obj);
        return null;
    }
}

export class Server {
    socket: WebSocket | null = null;
    my_uuid: string | null = null;
    known_peers: Map<number, Peer> = new Map();
    ip: string;
    port: number;
    private waiting_for: Map<string, any> = new Map();
    cached_channels: Map<number, Channel> = new Map();
    logged_in: boolean = false;
    we_have_the_metadata_lads: boolean = false;
    we_have_the_channels_lads: boolean = false;
    constructor(ip: string, port: number) {
        this.ip = ip;
        this.port = port;
    }

    public connect(uname: string, pword: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
            } catch (e) {
                reject("Invalid server IP/port");
                return;
            }
            this.socket.addEventListener("error", (error) => {
                let err_msg = "Could not connect to server: Error in websocket. Is the server down?";
                console.log(err_msg);
                reject(err_msg);
            });
            this.socket.addEventListener("open", (_) => {
                this.socket.send(JSON.stringify({"command": "login", "uname": uname, "passwd": pword}));
            });
            this.socket.addEventListener("message", (event) => {
                console.log(event.data);
                let obj = JSON.parse(event.data);
                if (this.waiting_for.has(obj["command"])) {
                    this.waiting_for.get(obj["command"])(obj);
                    this.waiting_for.delete(obj["command"]);
                }
        
                if (obj["command"] == "login" && obj["status"] == HTTP_FORBIDDEN) {
                    reject("Incorrect username or password! Try again.");
                } else if (obj["status"] != HTTP_OK) {
                    // err_msg = "Command '" + obj["command"] + "' failed with error code " + obj["status"];
                } else {
                    if (obj["command"] == "login") {
                        this.my_uuid = obj["uuid"];
                        this.socket.send(JSON.stringify({"command": "get_metadata"}));
                        this.socket.send(JSON.stringify({"command": "list_channels"}));
                        this.logged_in = true;
                    } else if (obj["command"] == "get_metadata") {
                        for (const peer_json of obj["data"]) {
                            let peer = Peer.from(peer_json);
                            if (peer !== null) {
                                this.known_peers.set(peer_json["uuid"], peer);
                            } else {
                                console.log("Peer json invalid froom " + this.ip + ":" + this.port);
                            }
                        }
                        this.we_have_the_metadata_lads = true;
                    }
                }
                if (obj["command"] == "list_channels") {
                    for (const channel_json of obj["data"]) {
                        let channel = Channel.from(channel_json);
                        if (channel !== null) {
                            this.cached_channels.set(channel.uuid, channel);
                        }
                    }
                    this.we_have_the_channels_lads = true;
                }
                if (this.logged_in && this.we_have_the_metadata_lads && this.we_have_the_channels_lads) {
                    resolve();
                }

            });
        });
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

    public async get_history(channel_uuid: number): Promise<Array<MessageInfo> | undefined> {
        let channel = this.get_channel(channel_uuid);
        if (channel === undefined) {
            return undefined;
        }
        if (channel.cached_messages.length < 100) {
            let history = await this.request({"command": "history", "channel": channel_uuid, "num": 1000});
            let messages = new Array<MessageInfo>();
            let i = 0;
            for (const message of history["data"]) {
                let peer = this.known_peers.get(message["author_uuid"]);
                if (peer !== undefined) {
                    messages[i] = new MessageInfo(message["content"], peer, new Date(message["date"] * 1000), message["uuid"]);
                    i++;
                } else {
                    console.log("Nonexistent peer: " + message["author_uuid"]);
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
            if (this.socket === null) {
                reject("Not connected");
                return;
            }
            this.waiting_for.set(data["command"], (data: any) => resolve(data));
            this.socket.send(JSON.stringify(data));
        });
    }
}

export let servers: Array<Server> = [];
export let sync_server: Server | null = null;
export function set_sync_server(server: Server) {
    sync_server = server;
}
export function add_server(server: Server) {
    servers.push(server);
    servers = servers;
}
