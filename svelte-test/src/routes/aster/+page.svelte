<script lang="ts">
    // TODO
    // Make messages scroll to the bottom. This is hard.
    // also consider not using sveltekit and having only one page.
    import Message from "../Message.svelte";
    import ChannelList from "../ChannelList.svelte";
    import { goto } from '$app/navigation';
    import type { MessageInfo } from "../network";
    import { sync_server, servers, Server, add_server, Peer, Channel } from "../network";
    export async function init_servers() {
        if (sync_server) {
            const server_list = (await sync_server.request({"command": "sync_get_servers"}))["servers"];
            for (const server of server_list) {
                console.log("Connectiong to " + server["ip"] + ":" + server["port"]);
                const connection = new Server(server["ip"], server["port"]);
                await connection.connect("KingJellyfish", "asdf");
                add_server(connection);
            }
            channels = sync_server.list_channels();
            sync_server.message_callback = on_message;
        } else {
            goto("/login");
        }
    }
    let messages: Array<MessageInfo> = [];
    let channels: Array<Channel> = [];
    init_servers().then(() => console.log("done init"));

    function on_message(message: MessageInfo) {
        messages.push(message);
        messages = messages;
        // can't scroll here, it doesn't know that we've added a message to the div yet!
    }

    function scroll_to_bottom(node: HTMLElement) {
        const message_elems = node.children;
        console.log(message_elems);
        if (message_elems.length == 0) {
            return;
        }
        message_elems[message_elems.length - 1].scrollIntoView();
        
    }

    function scroll_to_this(node: HTMLElement) {
        node.scrollIntoView();
    }

    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        console.log(channel);
        messages = [];
        sync_server?.get_history(uuid).then((msg) => messages = msg);
        selected_channel_uuid = uuid;
    }

    function send_message(event: KeyboardEvent) {
        if (selected_channel_uuid === null) {
            return;
        }
        if (event.key === "Enter") {
            sync_server?.request({command: "send", content: message_input, channel: selected_channel_uuid});
            message_input = "";
        }
    }

    let message_input: string = "";
    let selected_channel_uuid: number | null = null;
    // let message_area: HTMLDivElement;

</script>

<svelte:head>
    <title>Aster</title>
    <meta name="description" content="Aster web client" />
</svelte:head>


<div id="server-area">
    <div id="server-channels" class="container">
        <ChannelList {channels} on:switch_channel={switch_channel} />
    </div>
    <div id="server-messages" class="container">
        <input autofocus={true} id="message-input" placeholder=" Send a message" on:keypress={send_message} bind:value={message_input}/>
        <div id="message-area">
            {#each messages as message (message)}
                <div use:scroll_to_this><Message message={message} /></div>
            {/each}
        </div>
    </div>
</div>

<style>
input, textarea, button {
    border: 1px solid #444444;
    border-radius: 6px;
    color: inherit;
    background-color: inherit;
}

:global(body) {
    background-color: #1C1C1C;
    color: #d3d3d3;
    font-family: sans-serif;
}

input:focus {
    outline: none;
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
