<script lang="ts">
    import Message from "./Message.svelte";
    import ChannelList from "./ChannelList.svelte";
    import type { Server } from "./server";
    import { MessageInfo, can_notify } from "./network";
    import {
        Channel,
        ChannelNotFound,
        ServerError,
        Forbidden,
    } from "./network";
    import ProfileDialog from "./ProfileDialog.svelte";

    export let server: Server;
    let channels: Channel[];
    // TODO this gets called twice when switching channels (should be called 0 times???) for some reason
    // not critical but performance issue
    $: {
        server.conn.message_callback = on_message;
        server.conn.edit_callback = on_edit;
        channels = server.conn.list_channels();
        console.log("called");
    }
    let message_input: string = "";

    let show_profile_dialog = false

    // this is a bit of a hack
    // so basically, svelte seems to add objects from bottom-to-top, sometimes.
    // Therefore, we can't just wait for this to be called on the last element, and scroll it into view.
    // Essentially it will be called on the last element first, which we have to take a note of, and then
    // when it gets called on the first element (last), we can scroll the last element (first) into view.
    // we also try to scroll the last (first) element into view, just in case it is actually added last instead of first.
    let last_node: HTMLElement | undefined;
    const scroll_to_this = (
        node: HTMLElement,
        { is_last, is_first }: { is_last: boolean; is_first: boolean },
    ) => {
        if (is_last) {
            node.scrollIntoView();
            last_node = node;
        }
        if (is_first) {
            last_node?.scrollIntoView();
        }
    };

    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        server.messages = [];
        server.conn.get_history(uuid).then((msg) => {
            if (msg instanceof ChannelNotFound) {
            } else if (msg instanceof Forbidden) {
            } else if (msg instanceof ServerError) {
            } else {
                for (const m of msg) {
                    server.messages.push(m);
                }
                server.messages = server.messages;
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
        console.log("Got message from server " + server.conn.port.toString());
        console.log(message);
        if (message.channel_uuid == server.selected_channel_uuid) {
            server.messages.push(message);
            server.messages = server.messages;
        }
        if (
            can_notify &&
            message.author.uuid != server.conn.my_uuid &&
            (!document.hasFocus() ||
                message.channel_uuid != server.selected_channel_uuid)
        ) {
            new Notification(
                `${server.conn.name} #${server.conn.get_channel(message.channel_uuid)?.name}`,
                { body: `${message.author.display_name}: ${message.content}` },
            );
        }
    }

    function on_edit(channel_uuid: number) {
        if (channel_uuid == server.selected_channel_uuid) {
            // literally re-get the history. It's probably cached, anyway
            server.messages = [];
            server.conn.get_history(channel_uuid).then((msg) => {
                if (msg instanceof ChannelNotFound) {
                } else if (msg instanceof Forbidden) {
                } else if (msg instanceof ServerError) {
                } else {
                    for (const m of msg) {
                        server.messages.push(m);
                    }
                    server.messages = server.messages;
                }
            });
        }
    }

    function get_selected_channel(server: Server): Channel | undefined {
        if (server.selected_channel_uuid !== undefined) {
            return server.conn.get_channel(server.selected_channel_uuid);
        } else {
            return undefined;
        }
    }

    let selected_channel: Channel | undefined;
    $: selected_channel = get_selected_channel(server);
</script>

<div id="server-area">
    <div id="server-channels" class="container">
        <div id="server-info">
            <p id="server-ip">{server.conn.ip}:{server.conn.port}</p>
            <p class="server-info-text">Members: {server.conn.known_peers.size}</p>
            <button id="server-profile-button" on:click={() => (show_profile_dialog = true)}>Server Profile</button>
            <div class="separator" style="margin-top: 10px"/>
        </div>
        <ChannelList
            {channels}
            selected_channel={selected_channel}
            on:switch_channel={switch_channel}
        />
    </div>
    <div id="server-messages" class="container">
        <input
            autofocus={true}
            id="message-input"
            placeholder=" Send a message"
            on:keypress={send_message}
            bind:value={message_input}
        />
        <div id="message-area">
            {#each server.messages as message, idx (message.uuid)}
                <div
                    use:scroll_to_this={{
                        is_last: idx == server.messages.length - 1,
                        is_first: idx == 0,
                    }}
                >
                    <Message {message} />
                </div>
            {/each}
        </div>
    </div>
    {#if show_profile_dialog}
        <ProfileDialog
            on:dismiss={() => (show_profile_dialog = false)}
            server={server}
        />
    {/if}
</div>

<style>
    #message-area {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        overflow-y: scroll;
        margin-left: 10px;
        margin-right: 10px;
        border-radius: 16px;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
    }

    #server-messages {
        box-sizing: border-box;
        width: 100%;
        display: flex;
        margin-left: 13px;
        flex-direction: column-reverse;
    }

    #message-input {
        width: auto;
        min-height: 36px;
        margin: 16px;
        margin-bottom: 20px;
        background: var(--panel-1);
        border-radius: 36px;
        border-style: none;
        text-indent: 12px;
        color: #d3d3d3;
        font-size: 15px;
    }

    #server-area {
        width: 100%;
        margin-right: 18px;
        margin-bottom: 25px;
        display: flex;
        flex-direction: row;
    }
    #server-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: left;
    }
    #server-ip {
        margin-bottom: 15px;
        margin-left: auto;
        margin-right: auto;
    }
    .server-info-text {
        font-size: 13px;
        margin: 0;
        margin-left: 10%;
    }
    #server-channels {
        width: 280px;
        display: flex;
        flex-direction: column;
        color: var(--text-gray);
    }

    .container {
        background-color: var(--panel-2);
        height: 100%;
        border-radius: 16px;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
    }
</style>
