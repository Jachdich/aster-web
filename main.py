import socket, sys, time, re, html

#<DEBUG>
sys.path.append("..")
sys.path.append("../..")
import aster.asterpy.src.asterpy as asterpy
#</DEBUG>

import threading, base64
from flask import Flask, render_template, request, make_response
from flask_socketio import SocketIO

app = Flask(__name__)
sockio = SocketIO(app, async_mode='threading')

users = {}

EMOJI_PATTERN = r"(\$:(?:(?:(?:(?:[a-zA-z\-]+)\:\/{1,3})?(?:[a-zA-Z0-9])(?:[a-zA-Z0-9\-\.]){1,61}(?:\.[a-zA-Z]{2,})+|\[(?:(?:(?:[a-fA-F0-9]){1,4})(?::(?:[a-fA-F0-9]){1,4}){7}|::1|::)\]|(?:(?:[0-9]{1,3})(?:\.[0-9]{1,3}){3}))|localhost)(?:\:[0-9]{1,5}):(?:[0-9]+):\$)"
EMOJI_REGEX = re.compile(EMOJI_PATTERN)

def parse_for_emoji(msg):
    matches = EMOJI_REGEX.findall(msg)
    print(msg, matches)
    for emoji in matches:
        bits = emoji.split(":")
        print(emoji)
        
        ip = bits[1]
        port = int(bits[2])
        uuid = int(bits[3])
        html = f"<img src='/aster/emoji/{ip}/{port}/{uuid}.png' class='emoji'></img>"
        msg = msg.replace(emoji, html)

    return msg

class User:
    """Represents a web user"""
    def __init__(self, sid):
        self.sid = sid
        self.servers = []
        self.server_threads = []
        self.selected_server = 0
        self.selected_channel = None
        self.sync_server = None
        self.uname = None
        self.passwd = None

        #two temp vars for packets needed to create prefs
        self.sync_data = None
        self.sync_servers = None
        self.prefs = None

    def connect(self, ip, port, uname, password, uuid=None, callback=None, login=True, register=False):
        """connect to a specific server"""
        client = asterpy.Client(ip, port, uname, password, uuid, login, register)
        self.servers.append(client)
        client.on_message = lambda message: self.on_message(client, message)
        client.on_ready = lambda: self.on_ready(client)
        client.on_packet = lambda packet: self.on_packet(client, packet)
        client.callback = callback
        t = sockio.start_background_task(lambda: self.run_client(client))
        self.server_threads.append(t)
        return client

    def run_client(self, client):
        try:
            client.run()
        except ConnectionError:
            if self.sync_server is client:
                self.sockio_emit("sync_server_dead")
            else:
                self.sockio_emit("server_offline", {"server": client.uuid})
            self.servers.remove(client)

    def on_ready(self, server):
        if server == self.sync_server:
            #self.__set_prefs(server.get_sync())
            #server.on_packet("sync_get", self.__set_sync_data)
            #server.on_packet("sync_get_servers", self.__set_sync_servers)
            #server.send(the packets)
            self.sockio_emit("connected_to_sync")

        self.sockio_emit("login_successful", 0);
        emojis = server.list_emojis()
        self.sockio_emit("emojis", emojis)

        channels = server.get_channels()
        self.sockio_emit("channels", [channel.to_json() for channel in channels])
        if server.callback:
            server.callback()

    def disconnect(self):
        for server in self.servers:
            server.disconnect()

        for t in self.server_threads:
            t.join()

    def __send_messages_to_web(self, messages):
        msgs = []
        for message in messages:
            msg = message.to_json()
            msg["author_uuid"] = str(msg["author_uuid"])
            msg["author"] = self.servers[self.selected_server].get_name(message.author.uuid)
            msg["content"] = parse_for_emoji(html.escape(msg["content"]))
            msgs.append(msg)

        self.sockio_emit("message", {"messages": msgs})

    def __set_sync_data(self, sync_data: dict):
        self.sync_data = sync_data
        if self.sync_data is not None and self.sync_servers is not None:
            self.__load_prefs()

    def __set_sync_servers(self, sync_servers: dict):
        self.sync_servers = sync_servers
        if self.sync_data is not None and self.sync_servers is not None:
            self.__load_prefs()

    def __load_prefs(self):
        self.prefs = asterpy.SyncData.from_json(self.sync_data, self.sync_servers)
    
    def on_message(self, server, message):
        """called when any server sends a message"""
        print(f"on_message called with data {message.to_json()} to sid {self.sid}")
        self.__send_messages_to_web([message,])

    def on_packet(self, server, packet):
        if server == self.sync_server:
            if packet["command"] == "register" or packet["command"] == "login":
                uuid = packet["uuid"]
                self.sockio_emit("pfp_button", {"uuid": str(uuid)})

    def on_web_message(self, message):
        """called when the web client sends us data"""
        if message["req"] == "send_message":
            self.selected_channel.send(message["message"])
            #TODO send partial message??
            #self.__send_messages_to_web([
            #    asterpy.Message(
            #        message["message"],
            #        asterpy.User(
            #            self.servers[self.selected_server].self_uuid,
            #            self.servers[self.selected_server].username
            #        ),
            #        None,
            #        0
            #    ),]
            #)
                    
        elif message["req"] == "change_channel":
            serv = self.servers[self.selected_server]
            self.selected_channel = serv.get_channel_by_name(message["channel"])
            history = serv.get_history(self.selected_channel)
            self.__send_messages_to_web(history)

        elif message["req"] == "login":
            server = self.connect(message["sync_ip"], message["sync_port"], message["uname"], message["password"])
            self.uname = message["uname"]
            self.passwd = message["password"]
            self.sync_server = server
        
        elif message["req"] == "register":
            server = self.connect(message["sync_ip"], message["sync_port"], message["uname"], message["password"], login=False, register=True)
            self.uname = message["uname"]
            self.passwd = message["password"]
            self.sync_server = server

        elif message["req"] == "add_server":
            self.connect(message["ip"], message["port"], self.uname, self.passwd, callback=lambda server: self.add_server_status(server))

    def get_pfp(self, uuid):
        """get the profile picture associated with a particular UUID"""
        #TODO this will not work with different pfps in different servers
        for server in self.servers:
            pfp = server.get_pfp(uuid)
            if pfp is not None:
                return pfp

    def sockio_emit(self, message_id, data=None):
        sockio.emit(message_id, data, to=self.sid)

@app.route("/aster")
def aster():
    return render_template("aster.html")

@app.route("/aster/pfp/<uuid>.png")
def pfp(uuid):
    uuid = int(uuid)
    #TODO WHAT THE FUCK DO I DO HERE?
    data = None
    for v in users.values():
        pfp = v.get_pfp(uuid)
        if pfp is not None:
            data = pfp
            break
    response = make_response(data)
    response.headers.set('Content-Type', 'image/png')
    return response

@app.route("/aster/emoji/<ip>/<port>/<uuid>.png")
def emoji(ip, port, uuid):
    emoji_val = asterpy.fetch_emoji(f"<:{ip}:{port}:{uuid}:>")
    if emoji_val == None:
        with open("static/404_emoji.png", "rb") as f:
            response = make_response(f.read())
    else:
        response = make_response(base64.b64decode(emoji_val.data))

    response.headers.set('Content-Type', 'image/png')
    return response

@sockio.event
def message(msg):
    curr_user = users[request.sid]
    curr_user.on_web_message(msg)

@sockio.on("connect")
def connect():
    print(f"Connecting {request.sid}")
    users[request.sid] = User(request.sid)
    
@sockio.on("disconnect")
def disconnect():
    print(f"Disconnecting {request.sid}")
    users[request.sid].disconnect()
    print("after disconnect")
    del users[request.sid]

if __name__ == "__main__":
    sockio.run(app, debug=True, host="0.0.0.0")
