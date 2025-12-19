<script lang="ts">
    import type { Channel } from "./network";
    export let channel: Channel;
    export let init_selected: boolean;
    let button: HTMLButtonElement;
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function clicked() {
        dispatch("click", {"channel": channel});
        button.setAttribute("value", "1");
    }

    export function reset() {
        button.setAttribute("value", "0");
    }

</script>

<button class="btn-channel {channel.num_unread > 0 ? 'unread' : 'read'}"
        on:click={clicked} 
        value="{init_selected ? '1' : '0'}" 
        bind:this={button}>
    <div>
    {channel.name}
    </div>
    <div style="flex-grow: 1"></div>
    {#if channel.num_unread > 0}
    <div class="unread-num">
    {channel.num_unread}
    </div>
    {/if}
</button>

<style>
    .btn-channel {
        min-height: 30px;
        width: 96%;
        
        padding-left: 20px;
        
        color: var(--text-gray);
        background-color: inherit;
        
        border: none;
        border-radius: var(--radius-3);
        
        font-size: var(--font-size-body);
        text-align: left;
        
        box-sizing: border-box;
        list-style-type: none;

        display: flex;
        flex-direction: row;
    }

    .btn-channel:hover {
        background-color: var(--panel-1);
    }

    button:global(.btn-channel[value="1"]) {
        background-color: var(--panel-3);
    }
    button:global(.btn-channel[unread="1"]) {
        background-color: var(--panel-3);
    }

    .unread {
    }

    .read {
    }
    .unread-num {
        color: var(--white-1);
    }

    div {
        height: fit-content;
        margin: auto 0;
    }
</style>
