<script lang="ts">
    // TODO
    // Make messages scroll to the bottom. This is hard.
    // also consider not using sveltekit and having only one page.
    import Message from "../Message.svelte";
    import ChannelList from "../ChannelList.svelte";
    import ServerList from "../ServerList.svelte";
    import AddServerDialog from "../AddServerDialog.svelte";
    import { goto } from '$app/navigation';
    import type { MessageInfo } from "../network";
    import { sync_server, Server, Peer, Channel, ChannelNotFound, ServerError, Forbidden } from "../network";
    import add_server_img from "$lib/images/add_server.png";

    import "../styles.css";

    let servers: Server[] = [];
    export async function init_servers() {
        if (sync_server) {
            const server_list = (await sync_server.request({"command": "sync_get_servers"}))["servers"];
            for (const server of server_list) {
                console.log("Connectiong to " + server["ip"] + ":" + server["port"]);
                const connection = new Server(server["ip"], server["port"], sync_server.username, sync_server.password);
                await connection.connect();
                servers.push(connection);
                connection.message_callback = (message) => on_message(message, server);
            }
            servers = servers;
        } else {
            goto("/login");
        }
    }
    let messages: MessageInfo[] = [];
    let channels: Channel[] = [];
    let profile_img = "";
    init_servers().then(() => console.log("done init"));

    function on_message(message: MessageInfo, _: Server) {
        if (message.channel_uuid == selected_channel_uuid) {
            messages.push(message);
            messages = messages;
        }
    }

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
        messages = [];
        selected_server?.get_history(uuid).then((msg) => {
            if (msg instanceof ChannelNotFound) {
                
            } else if (msg instanceof Forbidden) {
                
            } else if (msg instanceof ServerError) {
                
            } else {
                messages = msg;
                setTimeout(() => scroll_to_bottom(message_area), 1); // Horrible hack because svelte is annoying
            }
        });
        selected_channel_uuid = uuid;
    }

    function send_message(event: KeyboardEvent) {
        if (selected_channel_uuid === null || selected_server === null) {
            return;
        }
        if (event.key === "Enter") {
            if (message_input.trim().length == 0) {
                return;
            }
            selected_server.request({command: "send", content: message_input, channel: selected_channel_uuid});
            message_input = "";
        }
    }

    // Add a new server
    function add_server(_: Event) {
        // ...sike! Actually only show the popup for the new server
        show_add_server = true;
    }

    // This time it actually adds the server, I promise
    // TODO: get rid of the any in the signature
    function add_server_for_real(info: CustomEvent<any>) {
        if (!sync_server) {
            // TODO: this shouldn't really be needed, and maybe we should throw an error instead?
            return;
        }
        let ip: string = info.detail.ip;
        let port: number = info.detail.port;
        
        class SyncServer {
            user_uuid: number;
            server_uuid: number;
            ip: string;
            port: number;
            idx: number;
            constructor(user_uuid: number, server_uuid: number, ip: string, port: number, idx: number) {
                this.user_uuid = user_uuid;
                this.server_uuid = server_uuid;
                this.ip = ip;
                this.port = port;
                this.idx = idx;
            }
        }
        const connection = new Server(ip, port, sync_server.username, sync_server.password);
        connection.connect().then(() => {
            servers.push(connection);
            servers = servers;
            let serialised_servers: SyncServer[] = [];
            let index: number = 0;
            for (const server of servers) {
                // TODO: hack
                const sync_server = new SyncServer(server.my_uuid as any, 0, server.ip, server.port, index++);
                serialised_servers.push(sync_server);
            }
            console.log(servers);
        
            sync_server?.request({command: "sync_set_servers", servers: serialised_servers}).then((response) => console.log(response));
        });
    }

    function switch_server(server: CustomEvent<Server>) {
        selected_server = server.detail;
        channels = selected_server.list_channels();
        messages = [];
    }

    let message_input: string = "";
    let selected_channel_uuid: number | null = null;
    let message_area: HTMLDivElement;
    let show_add_server: boolean = false;
    let selected_server: Server | null = null;

</script>

<svelte:head>
    <title>Aster</title>
    <meta name="description" content="Aster web client" />
</svelte:head>

<div id="page">
    <div id="top">
        <button id="add-server" on:click={add_server}><img src={add_server_img} alt="Add new server" class="icon"></button>
        <button id="settings"><img src={profile_img} alt="View profile" class="pfp" id="pfp_button"></button>
        <ServerList {servers} id="server-list" on:switch_server={switch_server}/>
    </div>
    <div id="server-area">
        <div id="server-channels" class="container">
            <ChannelList {channels} on:switch_channel={switch_channel} />
        </div>
        <div id="server-messages" class="container">
            <input autofocus={true} id="message-input" placeholder=" Send a message" on:keypress={send_message} bind:value={message_input}/>
            <div id="message-area" bind:this={message_area}>
                {#each messages as message, idx (message.uuid)}
                    <div use:scroll_to_this={idx == messages.length - 1}><Message message={message} /></div>
                {/each}
            </div>
        </div>
    </div>
</div>

{#if show_add_server}
    <AddServerDialog on:dismiss={() => show_add_server = false } on:add_server={add_server_for_real}/>
{/if}

<style>

#top {
    height: 37px;
    width: 100%;
    display: flex;
    flex-direction: row;
}

.pfp {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-style: none;
    background-position: center;
    object-fit: cover;
}
.icon {
    width: 16x;
    height: 16px;
}

#add-server, #settings {
    background-color: #232323;
    border-radius: 16px;
    border-style: none;
    height: 46px;
    width: 46px;
    margin-left: 6px;
    margin-top: 0;
}

    
#page {
    display: flex;
    flex-direction: column;
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #363636;
    border-radius: 15px;
}

::-webkit-scrollbar-thumb:hover {
    background: #565656;
}

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
