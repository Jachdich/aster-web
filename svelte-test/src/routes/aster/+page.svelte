<script lang="ts">
    import Message from "../Message.svelte";
    import ChannelButton from "../ChannelButton.svelte";
    import { goto } from '$app/navigation';
    import { MessageInfo } from "../network";
    import { sync_server, servers, Server, add_server, Peer } from "../network";
    export async function init_servers() {
        if (sync_server) {
            const server_list = (await sync_server.request({"command": "sync_get_servers"}))["servers"];
            for (const server of server_list) {
                console.log("Connectiong to " + server["ip"] + ":" + server["port"]);
                const connection = new Server(server["ip"], server["port"]);
                await connection.connect("KingJellyfish", "asdf");
                add_server(connection);
            }
            const general = sync_server.get_channel_by_name("general").uuid;
            messages = await sync_server.get_history(general);
            console.log(messages);
            channels = sync_server.list_channels();
            console.log(channels);
        } else {
            goto("/login");
        }
    }
    // function add_message() {
    //     messages.push(new MessageInfo("teast ahofhaefhiuj", "KingJellyfish"));
    //     messages = messages;
    // }
    let messages: Array<MessageInfo> = [];
    let channels: Array<Channel> = [];
    init_servers().then(() => console.log("done init"));

    function switch_channel(event) {
        // for 
        // TODO either keep a list of channel button objects, or use radio buttons
        // also consider splitting this file into ChannelList, ServerList, MessageList, etc.
        // also consider not using sveltekit and having only one page.
    }

</script>

<svelte:head>
    <title>Aster</title>
    <meta name="description" content="Aster web client" />
</svelte:head>


<div id="server-area">
    <div id="server-channels">
        <ul id="channel-list">
            {#each channels as channel (channel)}
                <ChannelButton channel={channel} on:click={switch_channel} />
            {/each}
        </ul>
    </div>
    <div id="server-messages">
        <input rows="1" autofocus="true" id="message-input" placeholder=" Send a message"/>
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
