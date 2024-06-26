<script lang="ts">
    import Message from "./Message.svelte";
    import ChannelList from "./ChannelList.svelte";
    import type { Server } from "./server";
    import { MessageInfo } from "./network";
    import {
        Channel,
        ChannelNotFound,
        ServerError,
        Forbidden,
    } from "./network";

    export let server: Server;
    server.conn.message_callback = on_message;
    let channels: Channel[] = server.conn.list_channels();
    let message_input: string = "";
    let message_area: HTMLDivElement;

    function scroll_to_bottom(node: HTMLElement) {
        const message_elems = node.children;
        if (message_elems.length == 0) {
            return;
        }
        message_elems[message_elems.length - 1].scrollIntoView();
    }

    function scroll_to_this(node: HTMLElement, flag: boolean) {
        if (flag) {
            node.scrollIntoView();
        }
    }

    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        server.messages = [];
        server.conn.get_history(uuid).then((msg) => {
            if (msg instanceof ChannelNotFound) {
            } else if (msg instanceof Forbidden) {
            } else if (msg instanceof ServerError) {
            } else {
                server.messages = msg;
                setTimeout(() => scroll_to_bottom(message_area), 1); // Horrible hack because svelte is annoying
            }
        });
        server.selected_channel_uuid = uuid;
    }

    function send_message(event: KeyboardEvent) {
        if (server.selected_channel_uuid === null) {
            return;
        }
        if (event.key === "Enter") {
            if (message_input.trim().length == 0) {
                return;
            }
            server.conn.request({
                command: "send",
                content: message_input,
                channel: server.selected_channel_uuid,
            });
            message_input = "";
        }
    }

    function on_message(message: MessageInfo) {
        console.log("Got message from server " + this.conn?.port.toString());
        console.log(message);
        if (message.channel_uuid == server.selected_channel_uuid) {
            server.messages.push(message);
        }
        server.messages = server.messages;
    }
</script>

<div id="server-area">
    <div id="server-channels" class="container">
        <ChannelList {channels} on:switch_channel={switch_channel} />
    </div>
    <div id="server-messages" class="container">
        <input
            autofocus={true}
            id="message-input"
            placeholder=" Send a message"
            on:keypress={send_message}
            bind:value={message_input}
        />
        <div id="message-area" bind:this={message_area}>
            {#each server.messages as message, idx (message.uuid)}
                <div use:scroll_to_this={idx == server.messages.length - 1}>
                    <Message {message} />
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    #message-area {
        background-color: #222222;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        overflow-y: scroll;
    }

    #server-messages {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        margin-left: 13px;
        flex-direction: column-reverse;
    }

    #message-input {
        width: auto;
        height: 28px;
        min-height: 28px;
        margin: 16px;
        background: #363636;
        border-radius: 16px;
        border-style: none;
        text-indent: 12px;
        color: #d3d3d3;
    }

    #server-area {
        position: absolute;
        left: 12px;
        top: 95px;
        bottom: 12px;
        right: 12px;
        width: auto;
        height: auto;
        display: flex;
        flex-direction: row;
    }
    #server-channels {
        width: 220px;
        height: 100%;
        background: #232323;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
    }

    .container {
        background: #232323;
        /*border: 2px solid #444444;*/
        border-radius: 16px;
    }
</style>
