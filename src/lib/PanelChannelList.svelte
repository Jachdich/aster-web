<script lang="ts">
    import type { Channel } from "./network";
    import { createEventDispatcher } from "svelte";
    import ChannelListButton from "./ChannelListButton.svelte";

    // ugly hack: basically so we can store an extra 
    // `button` attribute on each channel. One day I'll fix this...
    export let channels: Array<any>;
    const dispatch = createEventDispatcher();
    export let selected_channel: Channel | undefined;
    function switch_channel(_: Event, channel: Channel) {
        if (selected_channel === channel) {
            return;
        }
        for (const chan of channels) {
            if (chan.button != null && chan.channel !== channel) {
                chan.button.reset();
            }
        }
        selected_channel = channel;
        dispatch("switch_channel", channel);
    }
</script>

<ul class="con-channel-list">
    {#each channels as channel (channel)}
        <ChannelListButton
            {channel}
            init_selected={channel.uuid === selected_channel?.uuid}
            on:click={(event) => switch_channel(event, channel)}
            bind:this={channel.button}
        />
    {/each}
</ul>

<style>
    .con-channel-list {
        margin-top: 0px;
        padding-left: 8px;
    }
</style>
