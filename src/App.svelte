<script lang="ts">
    // # ASTER COMPONENTS ------------------------------------------------------
    import PageLogin from "./lib/PageLogin.svelte";
    import PageLoading from "./lib/PageLoading.svelte";
    import PageMain from "./lib/PageMain.svelte";
    import DialogChangelog from "./lib/DialogChangelog.svelte";
    import ContextMenu from "./lib/ContextMenu.svelte";
    import Dialog from "./lib/Dialog.svelte";

    let show_changelog = false;

    // # WIDTH DETECTION & LOCALE ----------------------------------------------
    import { onMount, onDestroy } from 'svelte';
    import { initWindowSizeListener, removeWindowSizeListener } from './stores/window_size';

    let innerWidth = 0
    let innerHeight = 0
    $: is_mobile_width = innerWidth <= 1024

    import { i18nReady } from './i18n';
    let locale_ready = false;

    // wait until i18n has loaded before allowing app to render
    i18nReady.then(() => { 
        locale_ready = true;
    });

    onMount(() => {
        initWindowSizeListener();

        // custom theme loading
        const savedCSS = localStorage.getItem("custom_theme_css");
		if (savedCSS) {
			const existing = document.getElementById("custom-theme");
			if (existing) existing.remove();

			const style = document.createElement("style");
			style.id = "custom-theme";
			style.textContent = savedCSS;
			document.head.appendChild(style);
		}

        // uhh stuff
        const handler = (e: Event) => e.preventDefault();
        window.addEventListener('contextmenu', handler);

        return () => {
            window.removeEventListener('contextmenu', handler);
        };
    });

    onDestroy(() => {
        removeWindowSizeListener();
    });

    // # NETWORKING ------------------------------------------------------------
    import { Connection, 
        set_can_notify, 
        ServerError,
        ConnectionError, 
        Status, 
    } from "./lib/network";
    import { Server } from "./lib/server";

    let page_to_show: "Login" | "Loading" | "Main" = "Login";
    let error_msg = "";
    let sync_server: Connection | undefined = undefined;
    let servers: Server[] = [];

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
                page_to_show = "Login";
            } else if (result instanceof ConnectionError) {
                error_msg =
                    "For some unknown reason, the sync server connection failed. Check the sync server is up and the IP and port are correct.";
                page_to_show = "Login";
            } else {
                sync_server = server;
                init_servers(server);
                page_to_show = "Main";
            }
        });
        page_to_show = "Loading";
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

<svelte:window bind:innerWidth bind:innerHeight />

<main>
    <!-- Wait for i18n initialisation before showing app -->
    {#if locale_ready} 
        <!-- Handle page visibility -->
        {#if page_to_show == "Login"}
            <PageLogin authenticate={login} />
        {:else if page_to_show == "Loading"}
            <PageLoading/>
        {:else if page_to_show == "Main" && sync_server !== undefined}
            <PageMain {sync_server} {servers} {show_error} />
        {:else if page_to_show == "Main" && sync_server === undefined}
            <div>
                Major catestrophic error !!! the sync server is undefined yet the
                page has already been switched to Main (this should only happen once
                the sync server is not undefined anymore).
            </div>
        {/if}

        <!-- Handle error  -->
        {#if error_msg != ""}
            <Dialog id="error"
                    title="Error" 
                    on:dismiss={dismiss_error} >
                <div class="con-dialog-row">
                    <p>{error_msg}</p>
                </div>
            </Dialog>
            <!-- <div id="error" class="popup centre-window">
                <div style="margin-bottom: 5px;">{error_msg}</div>
                <button on:click={dismiss_error} id="error-dismiss">Ok</button>
            </div> -->
        {/if}

        <!-- handle DialogChanglelog.svelte visibility -->
        {#if show_changelog}
            <DialogChangelog on:dismiss={() => (show_changelog = false)}/>
        {/if}

        {#if !is_mobile_width}
            <!-- bottom left version number / changelog button -->
            <!-- needs a keydown event to stop A11y from complaining -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a  class="lab-version-number" 
                on:click={() => (show_changelog = true)}
                role="button" 
                tabindex="0"
                on:keydown={(_) => { }}>
                α-2.4.0
            </a>
        {/if}

        <!-- context menu for the entire app, options defined in components -->
        <ContextMenu/>
    {:else}
        <!-- loading spinner to display while i18n loads -->
        <PageLoading />
    {/if}
</main>

<style>
    .lab-version-number {
        position: absolute;
        bottom: 0;
        left: 0;
        
        margin: 0px;
        margin-left: 18px;
        margin-bottom: 5px;
        
        color: var(--text-gray);
        
        font-size: 14px;
        
        cursor: pointer;
    }
</style>
