import socket
import asterpy
import threading
from flask import Flask, render_template, request
from flask_socketio import SocketIO

app = Flask(__name__)
sockio = SocketIO(app)

users = {}

class Client:
    """Represents a web client"""
    def __init__(self, sid):
        self.sid = sid
        self.servers = []
        self.server_threads = []
        self.connect("cospox.com", 2345, "jamsbot", "", uuid=1284344576730345505)

    def connect(self, ip, port, uname, password, uuid=None):
        """connect to a specific server"""
        client = asterpy.Client(ip, port, uname, password, uuid)
        self.servers.append(client)
        client.on_message = lambda message: self.on_message(client, message)
        t = threading.Thread(target=self.servers[-1].run)
        self.server_threads.append(t)
        t.start()

    def on_message(self, client, message):
        """called when any server sends a message"""
        sockio.emit("message", message.content, to=self.sid)

    def on_web_message(self, message):
        """called when the web client sends us data"""
        if message["req"] == "send_message":
            self.servers[0].send(message["message"])

@app.route("/aster")
def aster():
    return render_template("aster.html")

@sockio.event
def message(msg):
    curr_user = users[request.sid]
    curr_user.on_web_message(msg)

@sockio.on("connect")
def connect():
    print(f"Connecting {request.sid}")
    users[request.sid] = Client(request.sid)

if __name__ == "__main__":
    sockio.run(app, debug=True)
