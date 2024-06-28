<script lang="ts">
    import LoginPrompt from "./lib/LoginPrompt.svelte";
    import Loading from "./lib/Loading.svelte";
    import { Connection, set_can_notify } from "./lib/network";
    import { Server } from "./lib/server";
    import ServerView from "./lib/ServerView.svelte";
    import ServerList from "./lib/ServerList.svelte";
    import AddServerDialog from "./lib/AddServerDialog.svelte";
    import add_server_img from "./assets/add_server.png";

    let show: "Login" | "Loading" | "Main" = "Login";
    let show_add_server = false;
    let error_msg = "";
    let servers: Server[] = [];
    let selected_server: Server | undefined = undefined;
    let profile_img = "";
    let sync_server: Connection | undefined = undefined;

    function login(
        uname: string,
        password: string,
        sync_ip: string,
        sync_port: number,
        action: "Login" | "Register",
    ) {
        // now sounds like a good time to ask for notif perms...
        Notification.requestPermission().then((permission) => {
            set_can_notify(permission === "granted");
        });
        let server = new Connection(sync_ip, sync_port, uname, password);
        server.connect(action).then(
            () => {
                sync_server = server;
                init_servers(server);
                show = "Main";
            },
            (err: string) => {
                error_msg = err;
                show = "Login";
            },
        );
        show = "Loading";
    }

    async function init_servers(sync_server: Connection) {
        const server_list = (
            await sync_server.request({ command: "sync_get_servers" })
        )["servers"];
        for (const server of server_list) {
            console.log(
                "Connectiong to " + server["ip"] + ":" + server["port"],
            );
            const connection = new Connection(
                server["ip"],
                server["port"],
                sync_server.username,
                sync_server.password,
            );
            try {
                await connection.connect("Login");
            } catch (err) {
                console.log("Error connecting to server");
                console.log(err);
            }
            servers.push(new Server(connection));
        }
        servers = servers;
    }

    function dismiss_error() {
        error_msg = "";
    }

    function switch_server(server: CustomEvent<Server>) {
        selected_server = server.detail;
        console.log("selected", server.detail);
    }

    // TODO: get rid of the any in the signature
    async function add_server(info: CustomEvent<any>) {
        if (sync_server === undefined) {
            // TODO: this shouldn't really be needed, and maybe we should throw an error instead?
            return;
        }
        let ip: string = info.detail.ip;
        let port: number = info.detail.port;

        let connection: Connection | [string, number] = new Connection(
            ip,
            port,
            sync_server.username,
            sync_server.password,
        );
        try {
            await connection.connect("Login");
        } catch (err) {
            try {
                await connection.connect("Register");
            } catch (err) {
                // I guess we're not online...
            }
        }
        servers.push(new Server(connection));
        servers = servers;
        sync_server.update_sync_servers(servers);
    }
</script>

<main>
    {#if show == "Login"}
        <LoginPrompt authenticate={login} />
    {:else if show == "Loading"}
        <Loading />
    {:else if show == "Main"}
        <div id="page">
            <div id="top">
                <button
                    id="add-server"
                    on:click={() => (show_add_server = true)}
                    ><img
                        src={add_server_img}
                        alt="Add new server"
                        class="icon"
                    /></button
                >
                <button id="settings"
                    ><img
                        src={profile_img}
                        alt="View profile"
                        class="pfp"
                        id="pfp_button"
                    /></button
                >
                <ServerList {servers} on:switch_server={switch_server} />
            </div>
            {#if selected_server !== undefined}
                <ServerView server={selected_server} />
            {/if}
        </div>
    {/if}

    {#if error_msg != ""}
        <div id="error" class="popup centre-window">
            <div style="margin-bottom: 5px;">{error_msg}</div>
            <button on:click={dismiss_error} id="error-dismiss">Ok</button>
        </div>
    {/if}
    {#if show_add_server}
        <AddServerDialog
            on:dismiss={() => (show_add_server = false)}
            on:add_server={add_server}
        />
    {/if}
</main>

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

    #add-server,
    #settings {
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
    #error-dismiss {
        width: 64px;
        margin: 0 auto;
        display: block;
    }
</style>
