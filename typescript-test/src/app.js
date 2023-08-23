"use strict";
const elem_prefs = document.getElementById("prefs");
const elem_background_fade = document.getElementById("background-fade");
const elem_new_server = document.getElementById("new-server");
const elem_new_port = document.getElementById("new-port-input");
const elem_new_ip = document.getElementById("new-ip-input");
const elem_error_msg = document.getElementById("error-msg");
const elem_error_box = document.getElementById("error-box");
let queued_errors = [];
function show_settings() {
    elem_prefs.style.display = "grid";
    elem_background_fade.style.display = "block";
}
function hide_settings() {
    elem_prefs.style.display = "none";
    elem_background_fade.style.display = "none";
}
function set_default_settings() {
    //TODO
}
function show_new_server() {
    elem_new_server.style.display = "grid";
    elem_background_fade.style.display = "block";
}
function hide_new_server() {
    elem_new_server.style.display = "none";
    elem_background_fade.style.display = "none";
}
function clear_new_server() {
    elem_new_port.value = "2345";
    elem_new_ip.value = "";
}
function show_error() {
    if (queued_errors.length > 0) {
        const text = queued_errors.pop();
        elem_error_msg.innerText = text;
        elem_error_box.style.display = "grid";
        elem_background_fade.style.display = "block";
    }
}
function add_error(text) {
    queued_errors.push(text);
    const display = elem_error_box.style.display;
    if (display === "none" || display === "") {
        show_error();
    }
}
document.getElementById("error-ok").onclick = function () {
    if (queued_errors.length > 0) {
        show_error();
    }
    else {
        elem_error_box.style.display = "none";
        elem_background_fade.style.display = "none";
    }
};
hide_settings();
hide_new_server();
set_default_settings();
clear_new_server();
// (document.getElementById("settings") as HTMLButtonElement).onclick = show_settings;
// (document.getElementById("add-server") as HTMLButtonElement).onclick = show_new_server;
document.getElementById("prefs-cancel").onclick = function () {
    hide_settings();
    set_default_settings();
};
document.getElementById("new-cancel").onclick = function () {
    hide_new_server();
    clear_new_server();
};
document.getElementById("new-ok").onclick = function () {
    const msg = {
        req: "add_server",
        ip: elem_new_ip.value,
        port: elem_new_port.value
    };
    hide_new_server();
    clear_new_server();
};
let socket = new WebSocket("ws://127.0.0.1:2345");
