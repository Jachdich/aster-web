import socket, sys, time

#<DEBUG>
sys.path.append("..")
sys.path.append("../..")
import aster.asterpy.src.asterpy as asterpy
#</DEBUG>

import threading
from flask import Flask, render_template, request, make_response
from flask_socketio import SocketIO

app = Flask(__name__)
sockio = SocketIO(app, async_mode='threading')

users = {}

class User:
    """Represents a web user"""
    def __init__(self, sid):
        self.sid = sid
        self.servers = []
        self.server_threads = []
        self.selected_server = 0
        self.sync_server = None

    def connect(self, ip, port, uname, password, uuid=None):
        """connect to a specific server"""
        client = asterpy.Client(ip, port, uname, password, uuid)
        self.servers.append(client)
        client.on_message = lambda message: self.on_message(client, message)
        client.on_ready = lambda: self.on_ready(client)
        t = sockio.start_background_task(self.servers[-1].run)
        self.server_threads.append(t)
        return client

    def on_ready(self, server):
        history = server.get_history(server.current_channel)
        self.__send_messages_to_web(history)

        channels = server.get_channels()
        sockio.emit("channels", [channel.to_json() for channel in channels])

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
            msgs.append(msg)

        sockio.emit("message", {"messages": msgs}, to=self.sid)

    def __set_prefs(self, prefs):
        pass

    def on_message(self, server, message):
        """called when any server sends a message"""
        print(f"on_message called with data {message.to_json()} to sid {self.sid}")
        self.__send_messages_to_web([message,])

    def on_web_message(self, message):
        """called when the web client sends us data"""
        if message["req"] == "send_message":
            self.servers[self.selected_server].send(message["message"])
            sockio.emit("message", {"content": message["message"], "author_uuid": str(self.servers[self.selected_server].self_uuid), "date": 0, "author": self.servers[self.selected_server].username})
        elif message["req"] == "change_channel":
            serv = self.servers[self.selected_server]
            serv.join(serv.get_channel_by_name(message["channel"]));
            history = serv.get_history(serv.current_channel)
            self.__send_messages_to_web(history)

        elif message["req"] == "login":
            server = self.connect(message["sync_ip"], message["sync_port"], message["uname"], message["password"])
            self.sync_server = server
            self.__set_prefs(server.get_sync())

    def get_pfp(self, uuid):
        """get the profile picture associated with a particular UUID"""
        #TODO this will not work with different pfps in different servers
        for server in self.servers:
            pfp = server.get_pfp(uuid)
            if pfp is not None:
                return pfp

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

@app.route("/aster/emoji/<uuid>.png")
def emoji(uuid):
    uuid = int(uuid)
    s = list(users.values())[0]
    data = s.servers[0].fetch_emoji(4603308611677741685)
    response = make_response(base64.b64decode(data["data"]))
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
