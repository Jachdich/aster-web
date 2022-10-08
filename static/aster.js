"use strict";
let socket = io();
let total_emojis = [];
let show_emojis = false;
let channel_buttons = [];
let queued_errors = [];
let self_user = undefined;

function show_settings() {
    document.getElementById("prefs").style.display = "grid";
    document.getElementById("background_fade").style.display = "block";
}

function hide_settings() {
    document.getElementById("prefs").style.display = "none";
    document.getElementById("background_fade").style.display = "none";
}

function set_default_settings() {
    //TODO
}

function show_new_server() {
    document.getElementById("new_server").style.display = "grid";
    document.getElementById("background_fade").style.display = "block";
}

function hide_new_server() {
    document.getElementById("new_server").style.display = "none";
    document.getElementById("background_fade").style.display = "none";
}

function clear_new_server() {
    document.getElementById("n_port").value = "2345";
    document.getElementById("n_ip").value = ""; 
}

function show_error() {
    const text = queued_errors.pop();
    document.getElementById("error_msg").innerText = text;
    document.getElementById("error_box").style.display = "grid";
    document.getElementById("background_fade").style.display = "block";
}

function add_error(text) {
    queued_errors.push(text);
    const display = document.getElementById("error_box").style.display;
    if (display === "none" || display === "") {
        show_error();
    }
}

hide_settings();
hide_new_server();
set_default_settings();
clear_new_server();

document.getElementById("settings").onclick = show_settings;
document.getElementById("add-server").onclick = show_new_server;
document.getElementById("s_cancel").onclick = function() {
    hide_settings();
    set_default_settings();
}

document.getElementById("n_cancel").onclick = function() {
    hide_new_server();
    clear_new_server();
}

document.getElementById("n_ok").onclick = function() {
    const ip = document.getElementById("n_ip");
    const port = document.getElementById("n_port");
    const msg = {
        req: "add_server",
        ip: ip,
        port: port
    };
    socket.send(msg);
    hide_new_server();
    clear_new_server();
}

document.getElementById("e_ok").onclick = function() {
    if (queued_errors.length > 0) {
        show_error();
    } else {
        document.getElementById("error_box").style.display = "none";
        document.getElementById("background_fade").style.display = "none";
    }
}

socket.on("add_server_status", function(data) {
    add_server(data);
});

socket.on("self", function(data) {
    self_user = data;
});

socket.on("pfp_button", function(data) {
    document.getElementById("pfp_button").src = "/aster/pfp/" + data["uuid"] + ".png";
});

document.getElementById("server-chat-msgbox").onkeypress = function(key) {
    let elem = document.getElementById("server-chat-msgbox");
    if (key.keyCode === 13) {
        socket.send({req: "send_message", message: elem.value});
        //TODO set partial message
        elem.value = "";
        return;
    }
}

document.getElementById("server-chat-msgbox").oninput = function(event) {
    const elem = document.getElementById("server-chat-msgbox");
    const last_word = elem.value.split(" ").at(-1);
    if (last_word.startsWith(":") && !show_emojis) {
        show_emojis = true;
        document.getElementById("emojis").style.display = "block";
    } else if (!last_word.startsWith(":") && show_emojis) {
        show_emojis = false;
        document.getElementById("emojis").style.display = "none";
    }
}

document.getElementById("login_button").onclick = function() {
    const msg = {
        req: "login",
        sync_ip:   document.getElementById("sync_ip_input").value,
        sync_port: parseInt(document.getElementById("sync_port_input").value),
        uname:     document.getElementById("uname_input").value,
        password:  document.getElementById("pw_input").value
    };
    socket.send(msg);
    document.getElementById("loading").style.display = "grid";
    document.getElementById("login").style.display = "none";
    document.cookie = `sync_ip=${msg.sync_ip}; sync_port=${msg.sync_port}; expires=2038-01-19, 03:14:08 UTC`;
}

document.getElementById("register_button").onclick = function() {
    const msg = {
        req: "register",
        sync_ip:   document.getElementById("sync_ip_input").value,
        sync_port: parseInt(document.getElementById("sync_port_input").value),
        uname:     document.getElementById("uname_input").value,
        password:  document.getElementById("pw_input").value
    };
    socket.send(msg);
    document.getElementById("loading").style.display = "grid";
    document.getElementById("login").style.display = "none";
    document.cookie = `sync_ip=${msg.sync_ip}; sync_port=${msg.sync_port}; expires=2038-01-19, 03:14:08 UTC`;
}

{
    let elem = document.getElementById("sync_port_input");
    if (elem.value === "") {
        elem.value = "2345";
    }
}

document.getElementById("idkwhatthisis").style.display = "none";

function get_html_from_message(val) {
    const small = false;
    let smalltxt = "";
    if (small) {
        smalltxt = "small-";
    }
    let image_html = "";
    if (!small) {
        image_html = `
        <img src="/aster/pfp/${val["author_uuid"]}.png" class="msgpfp">
        `;
    }

    let date = new Date(val["date"] * 1000);
    let date_str = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const html = `
    <div class="${smalltxt}message">
        ${image_html}
        <p class="${smalltxt}msguser">${val["author"]}: </p>
        <p class="${smalltxt}msgbody">${val["content"]}</p>
        <p class="${smalltxt}msgdate">${date_str}</p>
    </div>
    `;
    return html;
}

socket.on("connected_to_sync", function(data) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("idkwhatthisis").style.display = "grid";
});

socket.on("message", function(data) {
    let total_html = "";
    for (const val of data["messages"]) {
        let html = get_html_from_message(val);
        total_html += html;
    }
    let elem = document.getElementById("message-area");
    elem.innerHTML += total_html;
    elem.scrollTop = elem.scrollHeight;
});

socket.on("login_successful", function(id) {
    set_default_settings();
});

socket.on("channels", function(data) {
    let elem = document.getElementById("channel-list");
    for (let channel of channel_buttons) {
        channel.remove();
    }
    for (const channel of data) {
        const name = channel["name"];
        //basically what this atrosity does is
        //add # onto the start of the channel name if it doesn't already start with # or &
        const prefix = name.charAt(0) == '&' ? '' : (name.charAt(0) == '#' ? '' : '#');
        let button = document.createElement("button");
        button.className = "channel-button";
        button.onclick = function() { changeChannel(name, button); };
        button.innerText = prefix + name;
        button.setAttribute("value", 0);
        
        channel_buttons.push(button);
        elem.appendChild(button);
    }
});

socket.on("emojis", function(data) { for (const emoji of data) { total_emojis.push(emoji); } });
socket.on("servers", function(data) { for (const server of data) { add_server(server); } });

socket.on("sync_server_dead", function() {
    alert("The sync server you entered is offline");
    document.getElementById("loading").style.display = "none";
    document.getElementById("login").style.display = "grid";
});

function changeChannel(channel, button) {
    if (button.value == "1") return;
    for (let b of channel_buttons) {
        b.value = 0;
    }
    button.value = 1;
    let elem = document.getElementById("message-area");
    elem.innerHTML = "";
    socket.send({req: "change_channel", channel: channel});
}

let server_buttons = [];

function server_button_clicked(button) {
    if (button.value == "1") return; //no need to do anything, button already selected

    //disable all other buttons
    for (let b of server_buttons) {
        b.value = "0";
    }
    button.value = "1";
}

function add_server(server) {
    let button = document.createElement("button");
    button.className = "server";
    button.setAttribute("value", 0);
    const img = document.createElement("img")
    img.className = "serverimg";
    img.src = server["img"];
    button.appendChild(img)
    document.getElementById("servers").appendChild(button);

    button.onclick = function() {
        server_button_clicked(button);
    }

    server_buttons.push(button);
}
