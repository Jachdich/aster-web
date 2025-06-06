<script lang="ts">
    import { is_mobile_width } from '../stores/window_size'
    import { onMount } from "svelte";
    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });


    // # ICONOGRAPHY & LOCALE --------------------------------------------------
    import { Icon } from "svelte-icons-pack";
    import { FiPlus, FiUser } from "svelte-icons-pack/fi";
    import { aster_logo_small } from "./logos";
    import { t } from "svelte-i18n";


    // # ASTER COMPONENTS
    import DialogAster from "./DialogTheme.svelte";
    import DialogAddServer from "./DialogAddServer.svelte";
    import DialogAccount from "./DialogAccount.svelte";
    import PanelServerView from "./PanelServerView.svelte";
    import PanelServerList from "./PanelServerList.svelte";

    let show_add_server = false;
    let show_aster_dialog = false;
    let show_account_dialog = false;
    export let show_sidebar = true;
    export let show_messages = true;

    function handleKeydown(event: { shiftKey: any; key: string; }) {
        if (event.shiftKey && event.key === "F1") {
            show_sidebar = !show_sidebar;
        }
    }

    // # CONTEXT MENUS ---------------------------------------------------------
    import { showContextMenu }  from './contextMenuStore';

    const conMenu_sidebar = [
        {
            name: 'hide',
            onClick: con_hide_sidebar,
            displayText: $t('PageMain.conMenu_sidebar.hide_sidebar'),
            class: 'fa-solid fa-eye-slash',
            shortcut: 'Shift+F1'
        },
        {
            name: 'add_server',
            onClick: con_add_server,
            displayText: $t('PageMain.conMenu_sidebar.add_server'),
            class: 'fa-solid fa-plus',
            shortcut: ''
        },
    ];
    function con_hide_sidebar(){
        show_sidebar = !show_sidebar
    }
    function con_add_server(){
        show_add_server = true
    }

    // # NETWORKING ------------------------------------------------------------
    import { 
        Connection, 
        ServerError, 
        ConnectionError, 
        Status 
    } from "./network";
    import { Server } from "./server";

    export let servers: Server[];
    let selected_server: Server | undefined = undefined;
    export let sync_server: Connection;
    export let show_error: (_: string) => void;

    function switch_server(server: CustomEvent<Server>) {
        selected_server = server.detail;
        if ($is_mobile_width) {
            // show_sidebar = false
            show_messages = false
        }
    }

    // TODO: get rid of the any in the signature
    async function add_server(info: CustomEvent<any>) {
        if (sync_server === undefined) {
            // TODO: this shouldn't really be needed, 
            // and maybe we should throw an error instead?
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
</script>


<div class="con-main">
    {#if show_sidebar}
        <div class="con-sidebar"
            on:contextmenu={(e) => showContextMenu(e, conMenu_sidebar)} 
            role="region">
            <!-- Top Buttons Menu ------------------------------------------ -->
            <div class="con-top-buttons">
                <button class="btn-aster"
                        on:click={() => (show_aster_dialog = true)}>
                    <svg id="gra-main-logo" 
                         class="pixel-img" 
                         style="width: 32px; height: 32px" 
                         xmlns="http://www.w3.org/2000/svg" 
                         viewBox="0 0 16 16" 
                         fill="currentColor">
                        <path stroke="var(--panel-2)" 
                              style="width: 32px" 
                              d={aster_logo_small}/>
                    </svg>
                </button>
                <button class="btn-addserver" 
                        on:click={() => (show_add_server = true)}>
                    <Icon src={FiPlus} size="25px"/>
                </button>
                <button class="btn-account" 
                        on:click={() => (show_account_dialog = true)}>
                    <!-- <img
                        src={profile_img}
                        alt="View profile"
                        class="pfp"
                        class="pfp_button"
                    /> -->
                    <Icon src={FiUser} size="25px" />
                </button>
            </div>

            <!-- Server List ----------------------------------------------- -->
            <PanelServerList {servers} on:switch_server={switch_server}/>
        </div>
    {:else}
        <span class="con-channel-edge-separator"></span>
    {/if}

    <!-- Server View ------------------------------------------------------- -->
    {#if selected_server !== undefined}
        <PanelServerView server={selected_server} 
                         sidebar_shown={show_sidebar} 
                         show_messages={show_messages}/>
    {/if}
</div>


<!-- Dialogs --------------------------------------------------------------- -->
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
    .con-main {
        height: 100%; 
        width: 100%;
        
        display: flex;
        flex-direction: row;
    }

    @media (width >= 1024px) {
        .con-sidebar {
            height: 100%;
            width: 200px;
            min-width: 200px;
        }

        .con-top-buttons {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;

            margin-top: 20px;
            margin-bottom: 20px;
        }

        .btn-addserver,
        .btn-aster,
        .btn-account {
            margin-left: 6px;
        }
    }

    @media (width < 1024px) {
        .con-sidebar {
            height: 100%;
            width: 70px;
            min-width: 70px;
        }

        .con-top-buttons {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            margin-top: 20px;
            margin-bottom: 20px;
        }

        .btn-addserver,
        .btn-aster {
            margin-bottom: 5px;
            margin-left: 0px;
        }
        .btn-account {
            margin-left: 0px;
        }
    }

    .con-channel-edge-separator {
        height: 100%;
        min-width: 18px
    }

    .btn-addserver,
    .btn-account,
    .btn-aster {
        height: 46px;
        width: 46px;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        margin-top: 0;

        color: var(--white-1);
        background-color: var(--panel-2);

        border-style: none;
        border-radius: var(--radius-2);

        transition: background-color 0.4s ease;
    }

    .btn-aster {
        background-color: var(--accent-1-light);
    }
    .btn-aster:hover {
        background-color: var(--panel-2);
    }
    .btn-aster:hover path {
        stroke: var(--accent-1-light);
    }

    #gra-main-logo path{
        transition: stroke 0.4s ease;
    }

    .btn-addserver:hover,
    .btn-account:hover {
        background-color: var(--panel-1);
    }
</style>
