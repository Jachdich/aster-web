#![allow(clippy::wildcard_imports)]

use serde_json::json;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::{HashMap, DefaultHasher};
use serde::Deserialize;
use seed::{prelude::*, *};

fn init(_: Url, orders: &mut impl Orders<Msg>) -> Model {
    // let msg_sender = orders.msg_sender();
    
    Model {
        state: AsterState::Login,
        sync_ip: "localhost".into(),
        sync_port: 2345,
        uname: "KingJellyfish".into(),
        pword: "asdf".into(),
        servers: HashMap::new(),
        selected_server: None,
        error_showing: None,
        sync_uuid: 0,
    }
}

fn decode_message(message: WebSocketMessage, uuid: u64) -> Option<Msg> {
    if message.contains_text() {
        let decoded = message.json::<serde_json::Value>().ok()?;
        Some(Msg::WebSocketMessage(decoded, uuid))
    } else {
        None
    }
}

// `Model` describes the app state.
struct Model {
    state: AsterState,
    sync_ip: String,
    sync_port: u16,
    uname: String,
    pword: String,
    servers: HashMap<u64, Server>,
    selected_server: Option<u64>,
    error_showing: Option<String>,
    sync_uuid: u64,
}

enum ConnectionStatus {
    Connected(usize),
    Disconnected,
    Reconnecting,
}

enum AsterState {
    Login,
    Loading,
    Home,
}

struct Server {
    name: String,
    ip: String,
    port: u16,
    channels: Vec<Channel>,
    selected_channel: usize,
    web_socket: WebSocket,
    uuid: u64,
    connection_status: ConnectionStatus,
}

impl Server {
    fn new(ip: &str, port: u16, orders: &mut impl Orders<Msg>) -> Self {
        let mut hasher = DefaultHasher::new();
        format!("{}{}", ip, port).hash(&mut hasher);
        let uuid = hasher.finish();
        let socket = WebSocket::builder(format!("ws://{}:{}", ip, port), orders)
            .on_open(move || Msg::WebSocketOpened(uuid))
            .on_message(move |msg| decode_message(msg, uuid))
            .on_close(move |e| Msg::WebSocketClosed(e, uuid))
            .on_error(move || Msg::WebSocketFailed(uuid))
            .build_and_open()
            .unwrap();

        Self {
            name: "".into(),
            ip: ip.into(),
            port,
            channels: Vec::new(),
            selected_channel: 0,
            web_socket: socket,
            uuid,
            connection_status: ConnectionStatus::Disconnected,
        }
    }

    fn login(&self, uname: &str, pword: &str) {
        
    }

    fn register(&self, uname: &str, pword: &str) {
        
    }

    fn init(&self) {
        
    }

    fn handle_message(&mut self, msg: serde_json::Value) {
        log!(msg);
    }
}

#[derive(Deserialize)]
struct Channel {
    name: String,
    uuid: i64,
    #[serde(skip)]
    messages: Vec<Message>,
}


#[derive(Deserialize)]
struct Message {
    uuid: i64,
    content: String,
    author_uuid: i64,
    date: u64,
}

// `Msg` describes the different events you can modify state with.
#[derive(PartialEq)]
enum Msg {
    LoginClicked,
    RegisterClicked,
    SyncIpChanged(String),
    SyncPortChanged(String),
    UnameChanged(String),
    PwordChanged(String),
    ServerClicked(usize),
    ChannelClicked(usize),
    WebSocketOpened(u64),
    WebSocketClosed(CloseEvent, u64),
    WebSocketFailed(u64),
    WebSocketMessage(serde_json::Value, u64),
    ErrorOkClicked,
    AddServerClicked,
    SettingsClicked,
}

// `update` describes how to handle each `Msg`.
fn update(msg: Msg, model: &mut Model, orders: &mut impl Orders<Msg>) {
    match msg {
        Msg::SyncIpChanged(ip) => model.sync_ip = ip,
        Msg::SyncPortChanged(port) => {
            if port.is_empty() || port.parse::<u16>().is_ok() {
                model.sync_port = port.parse::<u16>().unwrap_or(0); //OK because previous line checks it
            }
        },
        Msg::UnameChanged(uname) => model.uname = uname,
        Msg::PwordChanged(pword) => model.pword = pword,
         
        Msg::RegisterClicked | Msg::LoginClicked => {
            if model.uname.is_empty() || model.pword.is_empty() {
                return; //TODO show "this field is required"
            }
            let s = Server::new(&model.sync_ip, model.sync_port, orders);
            if msg == Msg::RegisterClicked {
                s.register(&model.uname, &model.pword);
            } else {
                s.login(&model.uname, &model.pword);
            }
            model.sync_uuid = s.uuid;
            model.servers.insert(s.uuid, s);
            model.state = AsterState::Loading;
        },
        
        Msg::WebSocketOpened(uuid)    => model.servers.get(&uuid).unwrap().init(),
        Msg::WebSocketClosed(e, uuid) => {
            model.error_showing = Some(format!("Closed: {:?}", e));
            if uuid == model.sync_uuid {
                model.state = AsterState::Login;
            }
        },
        Msg::WebSocketFailed(uuid) => {
            model.error_showing = Some("Failed to create a websocket: Your browser is probably too old to run this web app.".to_string());
            if uuid == model.sync_uuid {
                model.state = AsterState::Login;
            }
        },
        Msg::WebSocketMessage(msg, uuid) => model.servers.get_mut(&uuid).unwrap().handle_message(msg),

        Msg::ErrorOkClicked => model.error_showing = None,
        _ => (), //TODO
    }
}

// `view` describes what to display.
fn view(model: &Model) -> Node<Msg> {
    div![
        if let Some(msg) = &model.error_showing {
            vec![
                div![
                    attrs!{At::Class => "popup"},
                    span![
                        attrs!{At::Id => "error_msg"},
                        msg
                    ],
                    button![
                        ev(Ev::Click, |_| Msg::ErrorOkClicked),
                        attrs!{At::Id => "error_ok"},
                        "OK",
                    ]   
                ],
                div![attrs!{At::Id => "background_fade"}]
            ]
        } else { vec![empty![]] }, //TODO this is ugly

        match &model.state {
          AsterState::Login => {
                let port = model.sync_port;
                let port_str = if port != 0 { port.to_string() } else { "".into() };
                div![
                    attrs!{At::Id => "login", At::Class => "popup"},
                    view_form_entry(&model.sync_ip, Msg::SyncIpChanged, "sync_ip", "Sync server IP", "Enter IP"),
                    view_form_entry(&port_str, Msg::SyncPortChanged, "sync_port", "Sync server port", "Enter port"),
                    view_form_entry(&model.uname, Msg::UnameChanged, "uname", "Username", "Enter username"),
                    view_form_entry(&model.pword, Msg::PwordChanged, "pw", "Password", "Enter password"),
                    button![ev(Ev::Click, |_| Msg::RegisterClicked), "Register"],
                    button![ev(Ev::Click, |_| Msg::LoginClicked), "Log in"],
                ]
            },
            AsterState::Loading => p!["Loading..."],
            AsterState::Home => view_home_screen(model),
        }
    ]
}

fn view_home_screen(model: &Model) -> Node<Msg> {
    div![
        attrs!{At::Id => "idkwhatthisis"},
        div![
            attrs!{At::Id => "top"},
            div![
                attrs!{At::Id => "server-list"},
                
            ],
            model.servers.iter().map(|(_, server)| view_server_icon(server)).collect::<Vec<Node<Msg>>>(),
            button![
                ev(Ev::Click, |_| Msg::AddServerClicked),
                attrs!{At::Id => "add-server"},
                img![attrs!{At::Src => "static/add.png"}]
            ],
            button![
                ev(Ev::Click, |_| Msg::SettingsClicked),
                attrs!{At::Id => "settings"},
                img![attrs!{At::Src => "static/settings.png"}]
            ],
        ]
    ]
}

fn view_server_icon(server: &Server) -> Node<Msg> {
    div![
        attrs!{At::Class => "server-module"},
        img![
            attrs!{At::Class => "server-icon", At::Src => format!("http://127.0.0.1:5000/aster/icon/{}/{}.png", server.ip, server.port)}
        ]
    ]
}

fn view_form_entry<F>(txt: &str, msg: F, id: &str, label_text: &str, hint: &str) -> Vec<Node<Msg>> 
where F: Fn(String) -> Msg + Clone + 'static {
    let id1 = id.to_owned() + "_label";
    let id2 = id.to_owned() + "_input";
    vec![
        label![
            attrs!{
                At::Id => id1,
                At::For => id2,
            },
            label_text
        ],
        input![
            attrs!{
                At::Id => id2,
                At::Placeholder => hint,
                At::Required => true,
                At::Type => if id == "pw" { "password" } else { "text" },
                At::Value => txt,
                At::Class => "login_input",
            },
            input_ev(Ev::Input, msg),
        ]
    ]
}

// (This function is invoked by `init` function in `index.html`.)
#[wasm_bindgen(start)]
pub fn start() {
    // Mount the `app` to the element with the `id` "app".
    App::start("app", init, update, view);
}
