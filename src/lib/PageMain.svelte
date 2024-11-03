<script lang="ts">
    import {
        Connection,
        ServerError,
        ConnectionError,
        Status,
    } from "./network";
    import { onMount } from "svelte";
    import { Server } from "./server";
    import PanelServerView from "./PanelServerView.svelte";
    import PanelServerList from "./PanelServerList.svelte";
    import DialogAddServer from "./DialogAddServer.svelte";
    import { Icon } from "svelte-icons-pack";
    import { FiPlus, FiUser } from "svelte-icons-pack/fi";
    import DialogAster from "./DialogTheme.svelte";
    import DialogAccount from "./DialogAccount.svelte";
    import {aster_logo_small} from "./logos";

    let show_add_server = false;
    let show_aster_dialog = false;
    let show_account_dialog = false;
    export let show_sidebar = true;
    export let servers: Server[];
    let selected_server: Server | undefined = undefined;
    export let sync_server: Connection;
    export let show_error: (_: string) => void;

    function switch_server(server: CustomEvent<Server>) {
        selected_server = server.detail;
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
            if (
                result.request == "login" &&
                result.status == Status.Forbidden
            ) {
                show_error("Incorrect password");
            } else if (
                result.request == "register" &&
                result.status == Status.Conflict
            ) {
                show_error("Username already in use");
            }
        } else if (result instanceof ConnectionError) {
            show_error("Couldn't connect to the server (is it down?)");
        } else {
            servers.push(new Server(connection));
            servers = servers;
            sync_server.update_sync_servers(servers);
        }
    }

    function update_settings(uname: string, password: string, pfp: string) {
        for (const s of servers) {
            s.conn.request({"command": "nick", "nick": uname}); // TODO handle results
            s.conn.request({"command": "change_password", "new_password": password});
            s.conn.request({"command": "pfp", "data": pfp});
        }
        // sync_server.request({"command": "nick", "nick": uname}); // TODO handle results
        // sync_server.request({"command": "pfp", "data": pfp});
    }

    function handleKeydown(event) {
        if (event.shiftKey && event.key === "F1") {
            show_sidebar = !show_sidebar;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div id="page">
    {#if show_sidebar}
        <div id="sidebar">
            <div id="top-buttons">
                <button id="aster-button" on:click={() => (show_aster_dialog = true)}>
                    <svg id="logo" class="pixel-img" style="width: 32px; height: 32px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                        <path stroke="var(--panel-2)" style="width: 32px" d={aster_logo_small}/>
                    </svg>
                </button>
                <button id="add-server" on:click={() => (show_add_server = true)}>
                    <Icon src={FiPlus} size="25px"/>
                </button>
                <button id="account" on:click={() => (show_account_dialog = true)}>
                    <!-- <img
                        src={profile_img}
                        alt="View profile"
                        class="pfp"
                        id="pfp_button"
                    /> -->
                    <Icon src={FiUser} size="25px" />
                </button>
            </div>
            <PanelServerList {servers} on:switch_server={switch_server} />
        </div>
    {:else}
        <span id="channel-edge-separator"></span>
    {/if}
    {#if selected_server !== undefined}
        <PanelServerView server={selected_server} sidebar_shown={show_sidebar}/>
    {/if}
</div>

{#if show_add_server}
    <DialogAddServer
        on:dismiss={() => (show_add_server = false)}
        on:add_server={add_server}
    />
{/if}
{#if show_aster_dialog}
    <DialogAster on:dismiss={() => (show_aster_dialog = false)} />
{/if}
{#if show_account_dialog}
    <DialogAccount
        username={sync_server.username}
        pfp={sync_server.known_peers.get(sync_server.my_uuid)?.pfp}
        password={sync_server.password}
        update_settings={update_settings}
        on:dismiss={() => (show_account_dialog = false)}
    />
{/if}

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

    #channel-edge-separator {
        height: 100%;
        min-width: 18px
    }

    #add-server,
    #account,
    #aster-button {
        background-color: var(--panel-2);
        border-radius: var(--radius-2);
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
        transition: background-color 0.4s ease;
    }

    #aster-button {
        background-color: var(--accent-1-light);
    }

    #aster-button:hover {
        background-color: var(--panel-2);
    }

    #aster-button:hover path {
        stroke: var(--accent-1-light);
    }

    #logo path{
        transition: stroke 0.4s ease;
    }

    #add-server:hover,
    #account:hover {
        background-color: var(--panel-1);
    }

    #page {
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
    }
</style>
