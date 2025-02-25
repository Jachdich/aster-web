<script lang="ts">
    import { Style } from "./lib/style";
    import {
        Connection,
        set_can_notify,
        ServerError,
        ConnectionError,
        Status,
    } from "./lib/network";
    import { Server } from "./lib/server";
    
    import PageLogin from "./lib/PageLogin.svelte";
    import PageLoading from "./lib/PageLoading.svelte";
    import PageMain from "./lib/PageMain.svelte";
    import DialogChangelog from "./lib/DialogChangelog.svelte";

    let show: "Login" | "Loading" | "Main" = "Login";
    let error_msg = "";
    let sync_server: Connection | undefined = undefined;
    let servers: Server[] = [];
    let show_changelog = false;
    
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
                if (
                    result.request == "login" &&
                    result.status == Status.NotFound
                ) {
                    error_msg = "Unknown username";
                } else if (
                    result.request == "login" &&
                    result.status == Status.Forbidden
                ) {
                    error_msg = "Incorrect password";
                } else if (
                    result.request == "register" &&
                    result.status == Status.Conflict
                ) {
                    error_msg = "Username already in use";
                }
                show = "Login";
            } else if (result instanceof ConnectionError) {
                error_msg =
                    "Error connecting to sync server, is the server down or did you mistype the IP? (details: " +
                    result.detail +
                    ")";
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
            const connection = new Connection(
                server["ip"],
                server["port"],
                sync_server.username,
                sync_server.password,
            );
            connection.connect("Login").then((result) => {
                let name: string;
                if (server["name"] != null) {
                    name = server["name"];
                } else {
                    name = "<" + server["ip"] + ":" + server["port"] + ">";
                }
                if (result instanceof ServerError) {
                    if (
                        result.request == "login" &&
                        result.status == Status.NotFound
                    ) {
                        error_msg = "Unknown username for server " + name;
                    } else if (
                        result.request == "login" &&
                        result.status == Status.Forbidden
                    ) {
                        error_msg = "Incorrect password for server " + name;
                    }
                } else if (result instanceof ConnectionError) {
                    // for now, ignore it ig
                    // this probably just means the server is down...
                }
                servers.push(new Server(connection));
                servers = servers;
            });
        }
    }

    function dismiss_error() {
        error_msg = "";
    }

    function show_error(err: string) {
        error_msg = err;
    }
</script>

<main>
    {#if show == "Login"}
        <PageLogin authenticate={login} />
    {:else if show == "Loading"}
        <PageLoading />
    {:else if show == "Main" && sync_server !== undefined}
        <PageMain {sync_server} {servers} {show_error} />
    {:else if show == "Main" && sync_server === undefined}
        <div>
            Major catestrophic error !!!! the sync server is undefined yet the
            page has already been switched to Main (this should only happen once
            the sync server is not undefined anymore).
        </div>
    {/if}

    {#if error_msg != ""}
        <div id="error" class="popup centre-window">
            <div style="margin-bottom: 5px;">{error_msg}</div>
            <button on:click={dismiss_error} id="error-dismiss">Ok</button>
        </div>
    {/if}

    {#if show_changelog}
        <DialogChangelog on:dismiss={() => (show_changelog = false)}/>
    {/if}

    <a id="version-number" on:click={() => (show_changelog = true)}>
        ver. α-2.2.9
    </a>
</main>

<style>
    #error-dismiss {
        width: 64px;
        margin: 0 auto;
        display: block;
    }

    #version-number {
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 0px;
        margin-left: 18px;
        margin-bottom: 5px;
        font-size: 14px;
        color: var(--text-gray);
        cursor: pointer;
    }
</style>
