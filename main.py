from flask import Flask, render_template
from flask_socketio import SocketIO
import socket

app = Flask(__name__)
socket = SocketIO(app)

@app.route("/aster")
def aster():
       return render_template("aster.html")

@app.route("/socket.io.js")
def socketio():
    with open("socket.io.js", "r") as f:
        html = f.read()
    return html

@socket.on("hi")
def hi(msg):
    print(msg)

if __name__ == "__main__":
    socket.run(app)
