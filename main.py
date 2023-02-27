import socket, sys, time, re, html

#<DEBUG>
import asterpy_local as asterpy
#</DEBUG>

import threading, base64
# from flask import Flask, render_template, request, make_response, send_from_directory
# from flask_socketio import SocketIO
# from flask_sockets import Sockets

# app = Flask(__name__)
# sockio = SocketIO(app, async_mode='threading')
# sockets = Sockets(app)

from starlette.applications import Starlette
from starlette.responses import HTMLResponse, Response
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles
from starlette.endpoints import WebSocketEndpoint
import uvicorn

templates = Jinja2Templates(directory="templates")

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
    def __init__(self, ws):
        self.ws = ws
        self.servers = []
        self.selected_server = 0
        self.selected_channel = None
        self.sync_server = None
        self.uname = None
        self.passwd = None

        #two temp vars for packets needed to create prefs
        self.sync_data = None
        self.sync_servers = None
        self.prefs = None

    async def connect(self, ip, port, uname, password, uuid=None, callback=None, login=True, register=False):
        """connect to a specific server"""
        client = asterpy.Client(ip, port, uname, password, uuid, login, register)
        self.servers.append(client)
        
        async def on_message(message):
            await self.on_message(client, message)
        async def on_ready():
            await self.on_ready(client)
        async def on_packet(packet):
            await self.on_packet(client, packet)
        
        # client.on_message = lambda message: self.on_message(client, message)
        # client.on_ready = lambda: self.on_ready(client)
        # client.on_packet = lambda packet: self.on_packet(client, packet)
        client.callback = callback
        client.on_message = on_message
        client.on_ready = on_ready
        client.on_packet = on_packet
        client.task = asyncio.create_task(self.run_client())
        # t = sockio.start_background_task(lambda: self.run_client(client))
        # self.server_threads.append(t)
        return client

    async def run_client(self, client):
        try:
            await client.run()
        except ConnectionError:
            if self.sync_server is client:
                await self.sockio_emit("sync_server_dead")
            else:
                await self.sockio_emit("server_offline", {"server": client.uuid})
            self.servers.remove(client)

    async def on_ready(self, server):
        if server == self.sync_server:
            # self.__set_prefs(server.get_sync())
            server.call_on_packet("sync_get", self.__set_sync_data)
            server.call_on_packet("sync_get_servers", self.__set_sync_servers)
            server.send({"command": "sync_get"})
            server.send({"command": "sync_get_servers"})
            await self.sockio_emit("connected_to_sync")

        self.sockio_emit("login_successful", 0);
        emojis = server.list_emojis()
        self.sockio_emit("emojis", emojis)

        channels = server.get_channels()
        self.sockio_emit("channels", [channel.to_json() for channel in channels])
        if server.callback:
            server.callback(server)

    async def disconnect(self):
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
        if self.sync_data["status"] == 404:
            self.sync_data["uname"] = self.uname
            self.sync_data["pfp"] = None
        self.prefs = asterpy.SyncData.from_json(self.sync_data, self.sync_servers)
        # TODO set uname? self.uname = self.prefs.uname
        self.sockio_emit("servers", [{
            "img": s.pfp,
        } for s in self.prefs.servers])
        # TODO set prefs?
    
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
            self.connect(message["ip"], message["port"], self.uname, self.passwd, callback=lambda server: self.add_server(server))

    def get_pfp(self, uuid):
        """get the profile picture associated with a particular UUID"""
        #TODO this will not work with different pfps in different servers
        for server in self.servers:
            pfp = server.get_pfp(uuid)
            if pfp is not None:
                return pfp

    async def sockio_emit(self, data):
        await self.ws.send_text(json.dumps(data))


# TODO in production use static files
async def aster(request):
    template = "aster.html"
    context = {"request": request}
    return templates.TemplateResponse(template, context)

async def pfp(request):
    ip = request.path_params["ip"]
    port = request.path_params["port"]
    uuid = request.path_params["uuid"]
    data = asterpy.fetch_pfp(ip, port, uuid)
    return Response(data, media_type="image/png")

async def emoji(request):
    ip = request.path_params["ip"]
    port = request.path_params["port"]
    uuid = request.path_params["uuid"]
    emoji_val = asterpy.fetch_emoji(f"<:{ip}:{port}:{uuid}:>")
    if emoji_val == None:
        with open("static/404_emoji.png", "rb") as f:
            return Response(f.read(), media_type="image/png")
    else:
        return Response(base64.b64decode(emoji_val.data), media_type="image/png")

async def websocket_endpoint(ws):
    await ws.accept()
    client = Client(ws)
    while True:
        msg = await ws.receive_text()
        
    await ws.close()
    
class WebSocketConnection(WebSocketEndpoint):
    encoding = "json"
    async def on_connect(self, websocket):
        await websocket.accept()
        self.user = User(websocket)
    
    async def on_receive(self, ws, data):
        await self.user.on_web_message(data)
            
    async def on_disconnect(self, ws, code):
        await self.user.disconnect()

routes = [
    Route("/aster", aster),
    Mount("/pkg", app=StaticFiles(directory="pkg"), name="pkg"),
    Mount("/static", app=StaticFiles(directory="static"), name="static"),
    Route("/aster/emoji/{ip}/{port:int}/{uuid:int}.png", emoji),
    Route("/aster/pfp/{ip}/{port:int}/{uuid:int}.png", pfp),
    WebSocketRoute("/aster/ws", WebSocketConnection),
]

# @sockets.route("/aster/ws")
# def aster_socket(ws):
#     user = User(ws)
#     while not ws.closed:
#         user.on_web_message(ws.receive())
#     user.disconnect()

app = Starlette(debug=True, routes=routes)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)