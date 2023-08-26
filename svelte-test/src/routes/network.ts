import {browser} from '$app/environment';
const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;
let socket: WebSocket;

export let my_uuid: string | null = null;
export let err_msg: string | null = null;

interface Peer {
    myString: string;
    myNumber: number;
}

let known_peers: Map<string, Peer>;

export function log_in(uname: string, pword: string) {
    if (browser) {
        socket = new WebSocket("ws://localhost:2345");
        socket.addEventListener("error", (error) => {
            err_msg = "Could not connect to server: " + error;
            console.log(err_msg);
        });
        socket.addEventListener("open", (event) => {
            socket.send(JSON.stringify({"command": "login", "uname": uname, "passwd": pword}));
        });
        socket.addEventListener("message", (event) => {
            let obj = JSON.parse(event.data);
            
            if (obj["command"] == "login" && obj["status"] == HTTP_FORBIDDEN) {
                err_msg = "Incorrect username or password! Try again.";
            } else if (obj["status"] != HTTP_OK) {
                err_msg = "Command '" + obj["command"] + "' failed with error code " + obj["status"];
            } else {
                if (obj["command"] == "login") {
                    my_uuid = obj["uuid"];
                } else if (obj["command"] == "metadata") {
                    known_peers.set(obj["uuid"], obj);
                }
                console.log(obj);
            }
        });
    }
}

export function clear_error() {
    err_msg = null;
}

export function add_error(error: string) {
    err_msg = error;
}
