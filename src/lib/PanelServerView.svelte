<script lang="ts">
    import { is_mobile_width } from '../stores/window_size'

    // # ICONOGRAPHY & LOCALE --------------------------------------------------
    import { Icon } from "svelte-icons-pack";
    import { FiHelpCircle, FiArrowLeft } from "svelte-icons-pack/fi";
    import { t } from "svelte-i18n";

    // # SVELTE ----------------------------------------------------------------
    import { onMount } from "svelte";
    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

    // # ASTER COMPONENTS ------------------------------------------------------
    import DialogServerProfile from "./DialogServerProfile.svelte";
    import DialogKeybinds from "./DialogKeybinds.svelte";
    import ServerMessage from "./ServerMessage.svelte";
    import PanelChannelList from "./PanelChannelList.svelte";

    let show_profile_dialog = false;
    let show_channels = true;
    let show_messages = false;
    let show_keybinds = false;
    export let show_messages_call;
    export let show_sidebar;

    function handleKeydown(event) {
        if (event.shiftKey && event.key === 'F2') {
            show_channels = !show_channels;
        }
    }

    // # CONTEXT MENUS ---------------------------------------------------------
    import { showContextMenu }  from './contextMenuStore';

    const conMenu_channels = [
        {
            name: 'hide',
            onClick: con_hide_channels,
            displayText: $t('PanelServerView.conMenu_channels.hide_channels'),
            class: 'fa-solid fa-eye-slash',
            shortcut: 'Shift+F2'
        },
        // {
        //     name: 'hr',
        // },
    ];
    function con_hide_channels(){
        show_channels = !show_channels
    }

    const conMenu_msgtextarea = [
        {
            name: 'copy',
            onClick: con_copy,
            displayText: $t('PanelServerView.conMenu_msgtextarea.copy'),
            class: 'fa-solid fa-copy',
            shortcut: 'Ctrl+C'
        },
        // {
        //     name: 'paste',
        //     onClick: con_paste,
        //     displayText: 'Paste',
        //     class: 'fa-solid fa-paste',
        //     shortcut: 'Ctrl+V'
        // },
        {
            name: 'hr',
        },
        {
            name: 'help',
            onClick: con_help,
            displayText: $t('PanelServerView.conMenu_msgtextarea.help'),
            class: 'fa-solid fa-question',
            shortcut: ''
        },
    ];

    function con_help(){
        show_keybinds = true
    }
    function con_copy() {
        const selectedText = window.getSelection().toString();
        if (!selectedText) return; // nothing to copy

        navigator.clipboard.writeText(selectedText)
    }

    // # MESSAGE TEXTAREA ------------------------------------------------------
    let message_textarea = document.getElementById("message-input")
    let message_textarea_default_height = 32 // in pixels
    function autoResizeInput() {
        if (!message_textarea) return;

        message_textarea.style.height = "auto";
        message_textarea.style.height = Math.max(
            message_textarea.scrollHeight, 
            message_textarea_default_height
        ) + "px";
    }

    // # NETWORKING ------------------------------------------------------------
    import { tick } from "svelte";
    import type { Server } from "./server";
    import {
        Channel,
        ChannelNotFound,
        ServerError,
        Forbidden,
        MessageInfo,
    } from "./network";
    import PageLoading from "./PageLoading.svelte";
    
    let message_input: string = "";
    let no_scroll = false;
    let message_area: HTMLDivElement;

    export let server: Server;
    let channels: Channel[];
    // TODO: this gets called twice when switching channels 
    // (should be called 0 times???) for some reason
    // not critical but performance issue
    $: {
        server.conn.message_callback = on_message;
        server.conn.edit_callback = on_edit;
        channels = server.conn.list_channels();
        // console.log("called");
    }
    
    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        server.messages = [];
        server.conn.get_history(uuid, undefined).then((msg) => {
            if (msg instanceof ChannelNotFound) {
            } else if (msg instanceof Forbidden) {
            } else if (msg instanceof ServerError) {
            } else {
                if (selected_channel?.uuid !== uuid) {
                    // I guess the user changed the channel before 
                    // the request could complete. just ignore it.
                    return;
                }
                for (const m of msg) {
                    server.messages.push(m);
                }
                server.messages = server.messages;
                tick().then(() => {
                    message_area.scrollTop = message_area.scrollHeight;
                });

                show_messages = true
                if ($is_mobile_width) {
                    show_channels = false
                }
            }
        });
        server.selected_channel_uuid = uuid;
    }

    function send_message(event: KeyboardEvent) {
        if (server.selected_channel_uuid === null) {
            return;
        }
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (message_input.trim().length == 0) {
                return;
            }
            server.conn.request({
                command: "send",
                content: message_input,
                channel: server.selected_channel_uuid,
            });
            message_input = "";
            if (!message_textarea) return;
            message_textarea.style.height = message_textarea_default_height.toString() + "px"
        }
    }

    function on_message(message: MessageInfo) {
        if (message.channel_uuid == server.selected_channel_uuid) {
            const is_at_bottom =
                Math.abs(
                    message_area.scrollHeight 
                    - message_area.offsetHeight 
                    - message_area.scrollTop
                ) < 5;

            server.messages.push(message);
            server.messages = server.messages;

            if (is_at_bottom && !no_scroll) {
                tick().then(() => {
                    message_area.scrollTop = message_area.scrollHeight;
                });
            }
        }
    }

    function on_edit(channel_uuid: number) {
        if (channel_uuid == server.selected_channel_uuid) {
            // literally re-get the history. It's probably cached, anyway
            server.conn.get_history(channel_uuid, undefined).then((msg) => {
                if (msg instanceof ChannelNotFound) {
                } else if (msg instanceof Forbidden) {
                } else if (msg instanceof ServerError) {
                } else {
                    server.messages = [...msg];
                }
            });
        }
    }

    function get_selected_channel(server: Server): Channel | undefined {
        if (server.selected_channel_uuid !== undefined) {
            return server.conn.get_channel(server.selected_channel_uuid);
        } else {
            return undefined;
        }
    }

    async function message_scroll(event: UIEvent) {
        let div = event.target as HTMLDivElement;

        let scrolled_to_bottom = div.scrollTop === 0;
        if (scrolled_to_bottom) {
            no_scroll = false;
        }

        let scrolled_to_top = (div.scrollTop + div.scrollHeight - div.clientHeight === 0)
        if (scrolled_to_top && selected_channel !== undefined && server.messages.length > 0) {
            const before_id = server.messages[0].uuid;
            // console.log(before_id, server.requesting_history_from);

            // we've already started requesting history from this point. bail!
            // (requesting duplicate history is __very bad__)
            if (server.requesting_history_from.includes(before_id)) {
                return;
            }

            no_scroll = true;
            // top_scroll = div.children[0];
            server.requesting_history_from.push(before_id);
            const res = await server.conn.get_history(selected_channel.uuid, before_id);
            // console.log(res);
            if (res instanceof ChannelNotFound) {
                // cannot happen hopefully
            } else if (res instanceof Forbidden) {
                // what
            } else if (res instanceof ServerError) {
                // hmm...
            } else {
                // selected_channel.cached_messages = [...res, ...selected_channel.cached_messages];
                server.messages = [...res, ...server.messages];
                let init_height = message_area.scrollHeight;
                await tick();
                message_area.scrollTop = message_area.scrollHeight - init_height;
            }
            // server.requesting_history_from = server.requesting_history_from.filter(e => e !== before_id);
        }
    }

    let selected_channel: Channel | undefined;
    $: selected_channel = get_selected_channel(server);
</script>

<div id="server-area">
    <!-- Channel List ------------------------------------------------------ -->
    {#if show_channels}
        <div id="server-channels" 
             class="container" 
             on:contextmenu={(e) => showContextMenu(e, conMenu_channels)} 
             role="region">
            
            <!-- Server Info ----------------------------------------------- -->
            <div id="server-info">
                <p id="server-ip">{server.conn.ip}:{server.conn.port}</p>
                <p class="server-info-text">
                    {$t('PanelServerView.server_info.members')}: {server.conn.known_peers.size}
                </p>
                <button id="server-profile-button" 
                        on:click={() => (show_profile_dialog = true)}>
                    {$t('DialogServerProfile.title')}
                </button>
                <hr>
            </div>


            <!-- Channels -------------------------------------------------- -->
            <PanelChannelList
                {channels}
                selected_channel={selected_channel}
                on:switch_channel={switch_channel}
            />
        </div>
    {:else}
        {#if show_sidebar && show_channels}
            <span id="messages-edge-separator"></span>
        {/if}
    {/if}
    
    
    <!-- Server Area ------------------------------------------------------- -->
    {#if show_messages_call || show_messages}
        <div id="server-messages" class="container">
            <!-- Messages -->
            <div id="message-area" 
                 on:scroll={message_scroll} 
                 bind:this={message_area}>
                <!-- {#each server.messages as message (message.uuid)}
                    <div>
                        <ServerMessage {message} />
                    </div>
                {/each} -->
                {#each [...server.messages].reverse() as message (message.uuid)}
                    <div>
                        <ServerMessage {message} />
                    </div>
                {/each}
            </div>
            <!-- Message Input --------------------------------------------  -->
            <div id="message-input-container">
                <textarea
                    autofocus={true}
                    id="message-input"
                    placeholder={$t('PanelServerView.msgtextarea.placeholder')}
                    maxlength="5000"
                    rows="1"
                    bind:this={message_textarea}
                    on:input={autoResizeInput}
                    on:keypress={send_message}
                    bind:value={message_input}
                    style="height: {message_textarea_default_height}px;"
                    on:contextmenu={(e) => showContextMenu(e, conMenu_msgtextarea)} 
                />
            </div>

            <!-- Channel List Toggle --------------------------------------- -->
            {#if $is_mobile_width}
            <div id="toggle-container">
                <button id="channel-list-button" on:click={() => {
                        show_channels = true; 
                        show_messages = false;
                    }}>
                    <Icon src={FiArrowLeft} size="20px" />
                </button>
                <span>{selected_channel.name}</span>
            </div>
            {/if}
        </div>
    {/if}


    <!-- DIALOGS ----------------------------------------------------------- -->
    {#if show_profile_dialog}
        <DialogServerProfile
            on:dismiss={() => (show_profile_dialog = false)}
            server={server}
        />
    {/if}
    {#if show_keybinds}
        <DialogKeybinds
        on:dismiss={() => (show_keybinds = false)}
        />
    {/if}
</div>

<style>
    #server-area {
        width: 100%;
        /* max-width: calc(100% - 218px); */
        /* 218px = width of server list + right margin*/
        float: right;
        overflow: hidden;
        /* margin-right: 18px; */
        /* margin-left: 18px; */
        margin-bottom: 25px;
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        border-bottom-left-radius: var(--radius-2);
    }

    #message-area {
        display: flex;
        flex-direction: column-reverse;
        overflow: hidden;
        overflow-y: scroll;
        margin-left: 10px;
        margin-right: 10px;
        height: calc(100% - 48px);
    }

    #server-messages {
        box-sizing: border-box;
        flex: 1;
        float: right;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-left: 3px var(--panel-0) solid;
    }
    #server-channels {
        width: 280px;
        display: flex;
        flex-direction: column;
        color: var(--text-gray);
    }
    
    #messages-edge-separator {
        height: 100%;
        min-width: 18px;
    }

    #toggle-container {
        display: flex;
        flex-direction: row;
        margin-left: 8px;
        margin-bottom: 4px;
    }
    #toggle-container span {
        width: 80%;
        text-align: center;
    }

    #message-input-container {
        display: flex;
        flex-direction: row;
        width: calc(100% - 32px);
        /* min-height: 42px; */
        margin: 16px;
        margin-bottom: 20px;
    }

    @media (max-width: 1024px) {
        #server-area {
            margin-bottom: 0;
            border-radius: 0;
        }

        #server-channels {
            width: 100%;
        }

        #server-messages {
            border: none;
        }

        #message-input-container {
            margin: 8px;
        }

        #message-input {
            margin: 0px;
        }
    }

    #message-input {
        width: 100%;
        /* min-height: 36px;
        margin: 16px;
        margin-bottom: 20px; */
        background: var(--panel-1);
        border-radius: var(--radius-2);
        border-style: none;
        /* text-indent: 12px; */
        color: #d3d3d3;
        font-size: var(--font-size-body);
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 12px;
        max-height: 128px;
    }

    #server-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: left;
    }
    #server-ip {
        margin-bottom: 15px;
        margin-left: auto;
        margin-right: auto;
    }
    .server-info-text {
        font-size: 13px;
        margin: 0;
        margin-left: 10%;
    }

    #server-profile-button {
        width: 80%;
        margin: 0 auto;
        margin-top: 10px;
        margin-bottom: 14px;
        font-size: 14px;
        padding: 5px;
    }

    .container {
        background-color: var(--panel-2);
        height: 100%;
    }
</style>
