<script lang="ts">
    // TODO
    // Make messages scroll to the bottom. This is hard.
    // also consider not using sveltekit and having only one page.
    import ServerView from "../ServerView.svelte";
    import ServerList from "../ServerList.svelte";
    import AddServerDialog from "../AddServerDialog.svelte";
    import { goto } from '$app/navigation';
    import { sync_server, Connection, Peer, Channel, ChannelNotFound, ServerError, Forbidden, ConnectionMode } from "../network";
    import add_server_img from "$lib/images/add_server.png";
    import { Server } from "../server";

    import "../styles.css";

    let servers: Server[] = [];
    let selected_server: Server | null = null;
    export async function init_servers() {
        if (sync_server) {
            const server_list = (await sync_server.request({"command": "sync_get_servers"}))["servers"];
            for (const server of server_list) {
                console.log("Connectiong to " + server["ip"] + ":" + server["port"]);
                const connection = new Connection(server["ip"], server["port"], sync_server.username, sync_server.password);
                await connection.connect(ConnectionMode.Login);
                servers.push(new Server(connection));
            }
            if (servers.length === 0) {
                servers.push(new Server(sync_server));
            }
            servers = servers;
            switch_server({ detail: servers[0] } as any);
        } else {
            goto("/login");
        }
    }
    let profile_img = "";
    init_servers().then(() => console.log("done init"));

    // Add a new server
    function add_server(_: Event) {
        // ...sike! Actually only show the popup for the new server
        show_add_server = true;
    }

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
    // This time it actually adds the server, I promise
    // TODO: get rid of the any in the signature
    function add_server_for_real(info: CustomEvent<any>) {
        if (!sync_server) {
            // TODO: this shouldn't really be needed, and maybe we should throw an error instead?
            return;
        }
        let ip: string = info.detail.ip;
        let port: number = info.detail.port;
        
        const connection = new Connection(ip, port, sync_server.username, sync_server.password);
        connection.connect(ConnectionMode.Login).then(() => {
            servers.push(new Server(connection));
            servers = servers;
            let serialised_servers: SyncServer[] = [];
            let index: number = 0;
            for (const server of servers) {
                // TODO: hack
                const sync_server = new SyncServer(server.conn.my_uuid as any, 0, server.conn.ip, server.conn.port, index++);
                serialised_servers.push(sync_server);
            }
            console.log(servers);
        
            sync_server?.request({command: "sync_set_servers", servers: serialised_servers}).then((response) => console.log(response));
        });
    }

    function switch_server(server: CustomEvent<Server>) {
        selected_server = server.detail;
    }

    let show_add_server: boolean = false;

</script>

<svelte:head>
    <title>Aster</title>
    <meta name="description" content="Aster web client" />
</svelte:head>

<div id="page">
    <div id="top">
        <button id="add-server" on:click={add_server}><img src={add_server_img} alt="Add new server" class="icon"></button>
        <button id="settings"><img src={profile_img} alt="View profile" class="pfp" id="pfp_button"></button>
        <ServerList {servers} on:switch_server={switch_server}/>
    </div>
    {#if selected_server !== null}
        <ServerView server={selected_server} />
    {/if}
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

</style>
