<script lang="ts">
    import Message from "../Message.svelte";
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
            const channels = await sync_server.request({"command": "list_channels"});
            const general = channels["data"][0]["uuid"];
            const history = await sync_server.request({"command": "history", "num": 100, "channel": general});
            for (const message of history["data"]) {
                messages.push(new MessageInfo(message["content"], (sync_server.known_peers.get(message["author_uuid"]) as Peer).display_name));
            }
            messages = messages;
            console.log(messages);
            console.log(channels);
            console.log(general);
            console.log(history);
        } else {
            console.log("no sync server!");
        }
    }
    // function add_message() {
    //     messages.push(new MessageInfo("teast ahofhaefhiuj", "KingJellyfish"));
    //     messages = messages;
    // }
    let messages: Array<MessageInfo> = [];
    init_servers().then(() => console.log("done init"));

</script>

<svelte:head>
    <title>Aster</title>
    <meta name="description" content="Aster web client" />
</svelte:head>

<div id="message-area">
    {#each messages as message (message)}
        <Message message={message} />
    {/each}
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
