<script lang="ts">
    import Message from "./Message.svelte";
    import ChannelList from "./ChannelList.svelte";
    import type { MessageInfo } from "./network";
    import { Server, Channel, ChannelNotFound, ServerError, Forbidden } from "./network";

    import "./styles.css";
    
    export let server: Server;
    let messages: MessageInfo[] = [];
    let channels: Channel[] = server.list_channels();
    let message_input: string = "";
    let selected_channel_uuid: number | null = null;
    let message_area: HTMLDivElement;

    function on_message(message: MessageInfo, _: Server) {
        if (message.channel_uuid == selected_channel_uuid) {
            messages.push(message);
            messages = messages;
        }
    }
    
    function scroll_to_bottom(node: HTMLElement) {
        const message_elems = node.children;
        if (message_elems.length == 0) {
            return;
        }
        message_elems[message_elems.length - 1].scrollIntoView();
    }

    function scroll_to_this(node: HTMLElement, flag: boolean) {
        if (flag) {
            node.scrollIntoView();
        }
    }

    function switch_channel(channel: CustomEvent<Channel>) {
        const uuid = channel.detail.uuid;
        messages = [];
        server.get_history(uuid).then((msg) => {
            if (msg instanceof ChannelNotFound) {
                
            } else if (msg instanceof Forbidden) {
                
            } else if (msg instanceof ServerError) {
                
            } else {
                messages = msg;
                setTimeout(() => scroll_to_bottom(message_area), 1); // Horrible hack because svelte is annoying
            }
        });
        selected_channel_uuid = uuid;
    }

    function send_message(event: KeyboardEvent) {
        if (selected_channel_uuid === null) {
            return;
        }
        if (event.key === "Enter") {
            if (message_input.trim().length == 0) {
                return;
            }
            server.request({command: "send", content: message_input, channel: selected_channel_uuid});
            message_input = "";
        }
    }

</script>


<div id="server-area">
    <div id="server-channels" class="container">
        <ChannelList {channels} on:switch_channel={switch_channel} />
    </div>
    <div id="server-messages" class="container">
        <input autofocus={true} id="message-input" placeholder=" Send a message" on:keypress={send_message} bind:value={message_input}/>
        <div id="message-area" bind:this={message_area}>
            {#each messages as message, idx (message.uuid)}
                <div use:scroll_to_this={idx == messages.length - 1}><Message message={message} /></div>
            {/each}
        </div>
    </div>
</div>

<style>
#message-area {
    background-color: #222222;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: scroll;
}

#server-messages {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    margin-left: 13px;
    flex-direction: column-reverse;
}

#message-input {
    width: auto;
    height: 28px;
    min-height: 28px;
    margin: 16px;
    background: #363636;
    border-radius: 16px;
    border-style: none;
    text-indent: 12px;
    color: #d3d3d3;
}

#server-area {
    position: absolute;
    left: 12px;
    top: 95px;
    bottom: 12px;
    right: 12px;
    width: auto;
    height: auto;
    display: flex;
    flex-direction: row;
}
#server-channels {
    width: 220px;
    height: 100%;
    background: #232323;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
}

.container {
    background: #232323;
    /*border: 2px solid #444444;*/
    border-radius: 16px;
}

</style>
