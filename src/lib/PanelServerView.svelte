<script lang="ts">
    import { onMount } from "svelte";
    import type { Server } from "./server";
    import {
        Channel,
        ChannelNotFound,
        ServerError,
        Forbidden,
        MessageInfo,
    } from "./network";
    import { tick } from "svelte";
    import { Icon } from "svelte-icons-pack";
    import { FiHelpCircle } from "svelte-icons-pack/fi";

    import DialogServerProfile from "./DialogServerProfile.svelte";
    import DialogKeybinds from "./DialogKeybinds.svelte";
    import ServerMessage from "./ServerMessage.svelte";
    import PanelChannelList from "./PanelChannelList.svelte";

    export let show_messages = true;

    export let server: Server;
    let channels: Channel[];
    // TODO: this gets called twice when switching channels (should be called 0 times???) for some reason
    // not critical but performance issue
    $: {
        server.conn.message_callback = on_message;
        server.conn.edit_callback = on_edit;
        channels = server.conn.list_channels();
        // console.log("called");
    }
    let message_input: string = "";

    let show_profile_dialog = false;
    let show_channels = true;
    export let sidebar_shown;
    let show_keybinds = false;
    let no_scroll = false;
    let message_area: HTMLDivElement;

    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        server.messages = [];
        server.conn.get_history(uuid, undefined).then((msg) => {
            if (msg instanceof ChannelNotFound) {
            } else if (msg instanceof Forbidden) {
            } else if (msg instanceof ServerError) {
            } else {
                if (selected_channel?.uuid !== uuid) {
                    // I guess the user changed the channel before the request could complete. just ignore it.
                    return;
                }
                for (const m of msg) {
                    server.messages.push(m);
                }
                server.messages = server.messages;
                tick().then(() => {
                    message_area.scrollTop = message_area.scrollHeight - message_area.offsetHeight;
                });
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
        if (message.channel_uuid == server.selected_channel_uuid) {
            server.messages.push(message);
            server.messages = server.messages;
            if (!no_scroll) {
                tick().then(() => {
                    message_area.scrollTop = message_area.scrollHeight - message_area.offsetHeight;
                });
            }
        }
    }

    function on_edit(channel_uuid: number) {
        if (channel_uuid == server.selected_channel_uuid) {
            // literally re-get the history. It's probably cached, anyway
            server.conn.get_history(channel_uuid, undefined).then((msg) => {
                if (msg instanceof ChannelNotFound) {
                } else if (msg instanceof Forbidden) {
                } else if (msg instanceof ServerError) {
                } else {
                    server.messages = [...msg];
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

    async function message_scroll(event: UIEvent) {
        let div = event.target as HTMLDivElement;

        let scrolled_to_bottom = div.scrollHeight - div.offsetHeight == div.scrollTop;
        if (scrolled_to_bottom) {
            no_scroll = false;
        }

        let scrolled_to_top = div.scrollTop == 0;
        if (scrolled_to_top && selected_channel !== undefined && server.messages.length > 0) {
            const before_id = server.messages[0].uuid;
            // console.log(before_id, server.requesting_history_from);

            // we've already started requesting history from this point. bail!
            // (requesting duplicate history is __very bad__)
            if (server.requesting_history_from.includes(before_id)) {
                return;
            }

            no_scroll = true;
            // top_scroll = div.children[0];
            server.requesting_history_from.push(before_id);
            const res = await server.conn.get_history(selected_channel.uuid, before_id);
            // console.log(res);
            if (res instanceof ChannelNotFound) {
                // cannot happen hopefully
            } else if (res instanceof Forbidden) {
                // what
            } else if (res instanceof ServerError) {
                // hmm...
            } else {
                // selected_channel.cached_messages = [...res, ...selected_channel.cached_messages];
                server.messages = [...res, ...server.messages];
                let init_height = message_area.scrollHeight;
                await tick();
                message_area.scrollTop = message_area.scrollHeight - init_height;
            }
            // server.requesting_history_from = server.requesting_history_from.filter(e => e !== before_id);
        }
    }

    let selected_channel: Channel | undefined;
    $: selected_channel = get_selected_channel(server);
    // $: {
    //     console.log(server.messages);
    // }

    function handleKeydown(event) {
        if (event.shiftKey && event.key === 'F2') {
            show_channels = !show_channels;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div id="server-area">
    {#if show_channels}
        <div id="server-channels" class="container">
            <div id="server-info">
                <p id="server-ip">{server.conn.ip}:{server.conn.port}</p>
                <p class="server-info-text">Members: {server.conn.known_peers.size}</p>
                <button id="server-profile-button" on:click={() => (show_profile_dialog = true)}>Server Profile</button>
                <div class="separator" style="margin-top: 10px"/>
            </div>
            <PanelChannelList
                {channels}
                selected_channel={selected_channel}
                on:switch_channel={switch_channel}
            />
        </div>
        <span id="channel-messages-separator"></span>
    {:else}
        {#if sidebar_shown && show_channels}
            <span id="messages-edge-separator"></span>
        {/if}
    {/if}

    {#if show_messages}
        <div id="server-messages" class="container">
            <div id="message-input-container">
                <input
                    autofocus={true}
                    id="message-input"
                    placeholder=" Send a message"
                    on:keypress={send_message}
                    bind:value={message_input}
                />
                <div id="toggle-container">
                    <button id="channel-list-button" on:click={() => (show_channels = !show_channels)}>
                        <Icon src={FiHelpCircle} size="20px" />
                    </button>
                </div>
                <button id="help-button" on:click={() => (show_keybinds = true)}>
                    <Icon src={FiHelpCircle} size="20px" />
                </button>
            </div>
            <div id="message-area" on:scroll={message_scroll} bind:this={message_area}>
                {#each server.messages as message (message.uuid)}
                    <div>
                        <ServerMessage {message} />
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    {#if show_profile_dialog}
        <DialogServerProfile
            on:dismiss={() => (show_profile_dialog = false)}
            server={server}
        />
    {/if}
    {#if show_keybinds}
        <DialogKeybinds
        on:dismiss={() => (show_keybinds = false)}
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
        border-radius: var(--radius-2);
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
    }

    #channel-messages-separator {
        height: 100%;
        min-width: 13px;
    }
    
    #messages-edge-separator {
        height: 100%;
        min-width: 18px;
    }

    #toggle-container {
        display: flex;
        flex-direction: row;
        margin-left: 8px;
    }

    #server-messages {
        box-sizing: border-box;
        width: 100%;
        float: right;
        overflow: hidden;
        display: flex;
        /* margin-left: 13px; */
        flex-direction: column-reverse;
    }

    #message-input-container {
        display: flex;
        flex-direction: row;
        width: calc(100% - 32px);
        min-height: 36px;
        margin: 16px;
        margin-bottom: 20px;
    }

    #message-input {
        width: 100%;
        /* min-height: 36px;
        margin: 16px;
        margin-bottom: 20px; */
        background: var(--panel-1);
        border-radius: var(--radius-1);
        border-style: none;
        text-indent: 12px;
        color: #d3d3d3;
        font-size: 15px;
    }

    #help-button {
        background-color: var(--panel-1);
        border-radius: var(--radius-1);
        border-style: none;
        width: 36px;
        height: 36px;
        margin-left: 8px;
        margin-top: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--text-gray);
        transition: background-color 0.4s ease;
    }

    #help-button:hover {
        background-color: var(--panel-3);
        color: var(--white-1);
    }

    #server-area {
        width: 100%;
        /* max-width: calc(100% - 218px); */
        /* 218px = width of server list + right margin*/
        float: right;
        overflow: hidden;
        margin-right: 18px;
        /* margin-left: 18px; */
        margin-bottom: 25px;
        display: flex;
        flex-direction: row;
        justify-content: stretch;
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

    #server-profile-button {
        width: 80%;
        margin: 0 auto;
        margin-top: 10px;
        font-size: 14px;
        padding: 5px;
    }

    .container {
        background-color: var(--panel-2);
        height: 100%;
        border-radius: var(--radius-2);
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
    }
</style>
