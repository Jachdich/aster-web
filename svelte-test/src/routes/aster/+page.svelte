<script lang="ts">
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
        } else {
            goto("/login");
        }
    }
    let messages: Array<MessageInfo> = [];
    let channels: Array<Channel> = [];
    init_servers().then(() => console.log("done init"));

    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        console.log(channel);
        messages = [];
        sync_server.get_history(uuid).then((msg) => messages = msg);
    }

</script>

<svelte:head>
    <title>Aster</title>
    <meta name="description" content="Aster web client" />
</svelte:head>


<div id="server-area">
    <div id="server-channels">
        <ChannelList {channels} on:switch_channel={switch_channel} />
    </div>
    <div id="server-messages">
        <input autofocus={true} id="message-input" placeholder=" Send a message"/>
        <div id="message-area">
            {#each messages as message (message)}
                <Message message={message} />
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
}
</style>
