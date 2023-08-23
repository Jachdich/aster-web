use chrono::{DateTime, Utc};
use yew::prelude::*;

#[derive(Clone, PartialEq)]
struct Message {
    id: i64,
    author: i64,
    content: String,
    timestamp: DateTime<Utc>,
}

#[derive(Clone, PartialEq)]
struct Channel {
    id: i64,
    name: String,
    messages: Vec<Message>,
}

#[derive(Clone, PartialEq)]
struct User {
    id: i64,
    name: String,
    pfp: String,
}

#[function_component(F)]
#[function_component(App)]
fn app() -> Html {
    html! {
        <h1>{ "Hello World lol" }</h1>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
