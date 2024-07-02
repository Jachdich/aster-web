<script lang="ts">
    import LoginPrompt from "./lib/LoginPrompt.svelte";
    import Loading from "./lib/Loading.svelte";
    import {
        Connection,
        set_can_notify,
        ServerError,
        ConnectionError,
        Status,
    } from "./lib/network";
    import { Server } from "./lib/server";
    import ServerView from "./lib/ServerView.svelte";
    import ServerList from "./lib/ServerList.svelte";
    import AddServerDialog from "./lib/AddServerDialog.svelte";
    import { Icon } from 'svelte-icons-pack';
    import { FiPlus, FiUser } from "svelte-icons-pack/fi";
    import AsterDialog from "./lib/AsterDialog.svelte";
    import AccountDialog from "./lib/AccountDialog.svelte";
    import aster_logo_small_grey from "./assets/aster_logo_small_grey.png";

    let show: "Login" | "Loading" | "Main" = "Login";
    let show_add_server = false;
    let show_aster_dialog = false;
    let show_account_dialog = false;
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
        server.connect(action).then((result) => {
            if (result instanceof ServerError) {
                if (result.request == "login" && result.status == Status.NotFound) {
                    error_msg = "Unknown username";
                } else if (result.request == "login" && result.status == Status.Forbidden) {
                    error_msg = "Incorrect password";
                } else if (result.request == "register" && result.status == Status.Conflict) {
                    error_msg = "Username already in use";
                }
                show = "Login";
            } else if (result instanceof ConnectionError) {
                error_msg = "Error connecting to sync server, is the server down or did you mistype the IP? (details: " + result.detail + ")";
                show = "Login";
            } else {
                sync_server = server;
                init_servers(server);
                show = "Main";
            }
        });
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
            let result = await connection.connect("Login");

            let name: string;
            if (server["name"] != null) {
                name = server["name"];
            } else {
                name = "<" + server["ip"] + ":" + server["port"] + ">"
            }
            if (result instanceof ServerError) {
                if (result.request == "login" && result.status == Status.NotFound) {
                    error_msg = "Unknown username for server " + name;
                } else if (result.request == "login" && result.status == Status.Forbidden) {
                    error_msg = "Incorrect password for server " + name;
                }
            } else if (result instanceof ConnectionError) {
                // for now, ignore it ig
                // this probably just means the server is down...
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
        
        let result = await connection.connect("Login");
        if (result instanceof ServerError && result.status == Status.NotFound) {
            // try to register instead
            result = await connection.connect("Register");
        }

        
        if (result instanceof ServerError) {
            if (result.request == "login" && result.status == Status.Forbidden) {
                error_msg = "Incorrect password";
            } else if (result.request == "register" && result.status == Status.Conflict) {
                error_msg = "Username already in use";
            }
        } else if (result instanceof ConnectionError) {
            error_msg = "Couldn't connect to the server (is it down?)";
        } else {
            servers.push(new Server(connection));
            servers = servers;
            sync_server.update_sync_servers(servers);
        }
    }
</script>

<main>
    {#if show == "Login"}
        <LoginPrompt authenticate={login} />
    {:else if show == "Loading"}
        <Loading />
    {:else if show == "Main"}
        <div id="page">
            <div id="sidebar">
                <div id="top-buttons">
                    <button id="aster-button" on:click={() => (show_aster_dialog = true)}>
                        <img 
                            id="aster-logo" class="pixel-img" style="width: 32px;"
                            src={aster_logo_small_grey} 
                            alt="aster_logo_small_grey.png"
                        >
                    </button>
                    <button id="add-server" on:click={() => (show_add_server = true)}>
                        <Icon src={FiPlus} size=25px/>
                    </button>
                    <button id="account" on:click={() => (show_account_dialog = true)}>
                        <!-- <img
                            src={profile_img}
                            alt="View profile"
                            class="pfp"
                            id="pfp_button"
                        /> -->
                        <Icon src={FiUser} size=25px/>
                    </button>
                </div>
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
    {#if show_aster_dialog}
        <AsterDialog
            on:dismiss={() => (show_aster_dialog = false)}
        />
    {/if}
    {#if show_account_dialog}
    <AccountDialog
        on:dismiss={() => (show_account_dialog = false)}
    />
{/if}
</main>

<style>
    #sidebar {
        height: 100%;
        min-width: 200px;
        width: 200px;
    }

    #top-buttons {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .pfp {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border-style: none;
        background-position: center;
        object-fit: cover;
    }

    #add-server, #account, #aster-button {
        background-color: var(--panel-2);
        border-radius: 16px;
        border-style: none;
        height: 46px;
        width: 46px;
        margin-left: 6px;
        margin-top: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--white-1);
    }

    #aster-button {
        background-color: var(--accent-1-light);
    }

    #aster-button:hover {
        background-color: var(--accent-1-dark);
    }

    #add-server:hover, #account:hover {
        background-color: var(--panel-1);
    }

    #page {
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
    }
    #error-dismiss {
        width: 64px;
        margin: 0 auto;
        display: block;
    }
</style>
