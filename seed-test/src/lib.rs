// (Lines like the one below ignore selected Clippy rules
//  - it's useful when you want to check your code with `cargo make verify`
// but some rules are too "annoying" or are not applicable for your case.)
#![allow(clippy::wildcard_imports)]

use seed::{prelude::*, *};
const WS_URL: &str = "ws://127.0.0.1:5000/aster";

fn init(_: Url, _: &mut impl Orders<Msg>) -> Model {
    Model { 
        state: AsterState::Login,
        sync_ip: "".into(),
        sync_port: 2345,
        uname: "".into(),
        pword: "".into(),
        servers: Vec::new(),
        selected_server: Some(0),
    }
}

// `Model` describes the app state.
struct Model {
    state: AsterState,
    sync_ip: String,
    sync_port: u16,
    uname: String,
    pword: String,
    servers: Vec<Server>,
    selected_server: Option<usize>,
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
}

struct Channel {
    name: String,
    uuid: i64,
    messages: Vec<Message>,
}

struct Message {
    uuid: i64,
    content: String,
    author_uuid: i64,
    date: u64,
}

// `Msg` describes the different events you can modify state with.
enum Msg {
    LoginClicked,
    RegisterClicked,
    SyncIpChanged(String),
    SyncPortChanged(String),
    UnameChanged(String),
    PwordChanged(String),
    ServerClicked(usize),
    ChannelClicked(usize),
}

// `update` describes how to handle each `Msg`.
fn update(msg: Msg, model: &mut Model, _: &mut impl Orders<Msg>) {
    match msg {
        Msg::LoginClicked => (),
        Msg::SyncIpChanged(ip) => model.sync_ip = ip,
        Msg::SyncPortChanged(port) => {
            if port.is_empty() || port.parse::<u16>().is_ok() {
                model.sync_port = port.parse::<u16>().unwrap_or(0); //OK because previous line checks it
            }
        },
        Msg::UnameChanged(uname) => model.uname = uname,
        Msg::PwordChanged(pword) => model.pword = pword,
        Msg::LoginClicked => {
            
        }
        
        Msg::RegisterClicked => {
            
        }
        _ => (), //TODO
    }
}

// `view` describes what to display.
fn view(model: &Model) -> Node<Msg> {
    div![
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
