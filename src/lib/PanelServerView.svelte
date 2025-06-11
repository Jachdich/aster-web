<script lang="ts">
    import { is_mobile_width } from '../stores/window_size'

    // # ICONOGRAPHY & LOCALE --------------------------------------------------
    import { Icon } from "svelte-icons-pack";
    import { FiHelpCircle, FiArrowLeft } from "svelte-icons-pack/fi";
    import { init, t } from "svelte-i18n";

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
    import DialogImage from './DialogImage.svelte';
    import DialogMemberList from './DialogMemberList.svelte';

    let show_profile_dialog = false;
    let show_channels = true;
    let show_messages = false;
    let show_keybinds = false;
    let show_dialog_img = false;
    let show_memberlist = false;
    export let show_messages_call;

    let current_img_url: string;

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
        }
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
            console.log("loading history");

            const before_id = server.messages[0].uuid;
            // console.log(before_id, server.requesting_history_from);

            // we've already started requesting history from this point. bail!
            // (requesting duplicate history is __very bad__)
            if (server.requesting_history_from.includes(before_id)) {
                console.log("return, requesting duplicate history");
                // console.log(server.messages)
                return;
            }

            no_scroll = true;
            // top_scroll = div.children[0];
            server.requesting_history_from.push(before_id);
            const res = await server.conn.get_history(selected_channel.uuid, before_id);
            // console.log(res);
            if (res instanceof ChannelNotFound) {
                // cannot happen hopefully
                console.log("channel not found");
            } else if (res instanceof Forbidden) {
                // what
                console.log("forbidden");
            } else if (res instanceof ServerError) {
                // hmm...
                console.log("server error");
            } else {
                selected_channel.cached_messages = [...res, ...selected_channel.cached_messages];
                server.messages = [...res, ...server.messages];
                await tick();

                // jump the chat up a little bit to show history has loaded
                message_area.scrollTop -= 15;
            }
            server.requesting_history_from = server.requesting_history_from.filter(e => e !== before_id);
        }
    }

    let selected_channel: Channel | undefined;
    $: selected_channel = get_selected_channel(server);

    // # IMG DIALOG ------------------------------------------------------------

    function open_image_dialog(event: CustomEvent<{ image_url: string }>) {
        console.log(event.detail.image_url)
        current_img_url = event.detail.image_url
        show_dialog_img = true
    }
</script>

<div class="con-server-area">
    <!-- Channel List ------------------------------------------------------ -->
    {#if show_channels}
        <div class="pan-server-channels"
             on:contextmenu={(e) => showContextMenu(e, conMenu_channels)} 
             role="region">
            
            <!-- Server Info ----------------------------------------------- -->
            <div class="con-server-info">
                <p class="lab-server-ip">{server.conn.ip}:{server.conn.port}</p>
                <button class="btn-server-info" 
                        on:click={() => (show_memberlist = true)}>
                    {$t('PanelServerView.server_info.members')}: {server.conn.known_peers.size}
                </button>
                <button class="btn-server-info" 
                        on:click={() => (show_profile_dialog = true)}>
                    {$t('DialogServerProfile.title')}
                </button>
                
            </div>
            <hr>

            <!-- Channels -------------------------------------------------- -->
            <PanelChannelList
                {channels}
                selected_channel={selected_channel}
                on:switch_channel={switch_channel}
            />
        </div>
    {/if}
    
    
    <!-- Server Area ------------------------------------------------------- -->
    {#if show_messages_call || show_messages}
        <div class="pan-server-messages">
            <!-- Messages -->
            <div class="con-message-area" 
                 on:scroll={message_scroll} 
                 bind:this={message_area}>
                <!-- {#each server.messages as message (message.uuid)}
                    <div>
                        <ServerMessage {message} />
                    </div>
                {/each} -->
                {#each [...server.messages].reverse() as message (message.uuid)}
                    <div>
                        <ServerMessage {message} 
                        on:open_image={open_image_dialog}/>
                    </div>
                {/each}
            </div>
            <!-- Message Input --------------------------------------------  -->
            <div class="con-message-input">
                <!-- svelte-ignore a11y-autofocus -->
                <textarea
                    autofocus={true}
                    class="inp-message"
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
            <div class="con-channel-toggle">
                <button class="btn-channel-list" on:click={() => {
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
    {#if show_memberlist}
        <DialogMemberList
        known_peers={server.conn.known_peers}
        on:dismiss={() => (show_memberlist = false)}
        />
    {/if}
    {#if show_dialog_img}
        <DialogImage
        img_url={current_img_url}
        on:dismiss={() => (show_dialog_img = false)}
        />
    {/if}
</div>

<style>
    .con-server-area {
        width: 100%;

        float: right;

        display: flex;
        flex-direction: row;
        justify-content: stretch;

        margin-bottom: 25px;

        border-bottom-left-radius: var(--radius-2);

        overflow: hidden;
    }

    .con-message-area {
        height: calc(100% - 48px);

        display: flex;
        flex-direction: column-reverse;
;
        margin-left: 10px;
        margin-right: 10px;

        overflow: hidden;
        overflow-y: scroll
    }

    .pan-server-messages {
        height: 100%;
        
        float: right;

        display: flex;
        flex-direction: column;
        flex: 1;

        background-color: var(--panel-2);

        border-left: 3px var(--panel-0) solid;

        box-sizing: border-box;
        overflow: hidden;
    }
    .pan-server-channels {
        width: 240px;

        display: flex;
        flex-direction: column;

        color: var(--text-gray);
        background-color: var(--panel-2);
    }

    .con-channel-toggle {
        display: flex;
        flex-direction: row;

        margin-left: 8px;
        margin-bottom: 4px;
    }
    .con-channel-toggle span {
        width: 80%;
        text-align: center;
    }

    .con-message-input {
        width: calc(100% - 32px);

        display: flex;
        flex-direction: row;

        margin: 16px;
        margin-bottom: 20px;
    }

    @media (max-width: 1024px) {
        .con-server-area {
            margin-bottom: 0;
            border-radius: 0;
        }

        .pan-server-channels {
            width: 100%;
        }

        .pan-server-messages {
            border: none;
        }

        .con-message-input {
            margin: 8px;
        }

        .inp-message {
            margin: 0px;
        }
    }

    .inp-message {
        max-height: 128px;
        width: 100%;
        
        padding-top: 12px;
        padding-left: 24px;
        padding-right: 24px;
        
        color: #d3d3d3;
        background: var(--panel-1);
        
        border-radius: var(--radius-2);

        font-size: var(--font-size-body);
    }
    .inp-message:focus {
        outline: 0;
    }

    .con-server-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        margin-bottom: 14px;

        row-gap: 6px;
    }
    .lab-server-ip {
        margin-bottom: 6px;
        margin-left: auto;
        margin-right: auto;
    }

    .btn-server-info {
        width: 80%;
        
        margin: 0 auto;
        
        padding: 5px;
        
        font-size: 14px;
    }
</style>
