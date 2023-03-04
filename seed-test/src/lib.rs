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
        sync_ip: "".into(),
        sync_port: 2345,
        uname: "".into(),
        pword: "".into(),
        servers: HashMap::new(),
        selected_server: None,
        error_showing: None,
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
        let socket = WebSocket::builder(format!("wss://{}:{}", ip, port), orders)
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

    fn handle_message(&mut self, msg: serde_json::Value) {
        
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
            model.servers.insert(s.uuid, s);
        },
        
        // Msg::WebSocketOpened    => model.connection_status = ConnectionStatus::Connected(0),
        // Msg::WebSocketClosed(_) => model.connection_status = ConnectionStatus::Disconnected,
        Msg::WebSocketFailed(uuid)    => model.error_showing = Some("Failed to create a websocket: Your browser is probably too old to run this web app.".to_string()),
        Msg::WebSocketMessage(msg, uuid) => model.servers.get_mut(&uuid).unwrap().handle_message(msg),
        _ => (), //TODO
    }
}

// `view` describes what to display.
fn view(model: &Model) -> Node<Msg> {
    div![
        if let Some(msg) = &model.error_showing {
            div![
                attrs!{At::Class => "popup"},
                
            ]
        } else { empty![] },

        match &model.state {
          AsterState::Login => {
                let port = model.sync_port;
                let port_str = if port != 0 { port.to_string() } else { "".into() };
                div![
                    attrs!{At::Id => "login"},
                    view_form_entry(&model.sync_ip, Msg::SyncIpChanged, "sync_ip", "Sync server IP", "Enter IP"),
                    view_form_entry(&port_str, Msg::SyncPortChanged, "sync_port", "Sync server port", "Enter port"),
                    view_form_entry(&model.uname, Msg::UnameChanged, "uname", "Username", "Enter username"),
                    view_form_entry(&model.pword, Msg::PwordChanged, "pw", "Password", "Enter password"),
                    button![ev(Ev::Click, |_| Msg::RegisterClicked), "Register"],
                    button![ev(Ev::Click, |_| Msg::LoginClicked), "Log in"],
                ]
            },
            AsterState::Loading => empty![],
            AsterState::Home => empty![],
        }
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
