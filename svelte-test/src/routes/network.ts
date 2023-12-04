// import {browser} from '$app/environment';
const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;

export class MessageInfo {
    content: string;
    username: string;
    constructor(content: string, username: string) {
    	this.username = username;
    	this.content = content;
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
}

export class Server {
    socket: WebSocket | null = null;
    my_uuid: string | null = null;
    known_peers: Map<number, Peer> = new Map();
    ip: string;
    port: number;
    private waiting_for: Map<string, any> = new Map();
    logged_in: boolean = false;
    cached_channels: Map<number, Channel> = new Map();
    
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
                        this.socket.send(JSON.stringify({"command": "metadata"}));
                        this.logged_in = true;
                    } else if (obj["command"] == "metadata") {
                        for (const peer_json of obj["data"]) {
                            let peer = Peer.from(peer_json);
                            if (peer !== null) {
                                this.known_peers.set(peer_json["uuid"], peer);
                            } else {
                                console.log("Peer json invalid froom " + this.ip + ":" + this.port);
                            }
                        }
                        if (this.logged_in) {
                            resolve();
                        }
                    }
                }
            });
        });
    }
    // TODO think *really really hard* about this function
    // hint: fetch vs get
    public get_channel(uuid: number) {
        
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
