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

<button class="channel-button" 
        on:click={clicked} 
        value="{init_selected ? '1' : '0'}" 
        bind:this={button}>
    {channel.name}
</button>

<style>
    .channel-button {
        box-sizing: border-box;
        list-style-type: none;
        border: none;
        background-color: inherit;
        color: var(--text-gray);
        width: 96%;
        text-align: left;
        padding-left: 20px;
        border-radius: var(--radius-3);
        min-height: 30px;
        font-size: 15px;
    }
    .channel-button:hover {
        background-color: var(--panel-1);
    }

    button:global(.channel-button[value="1"]) {
        background-color: var(--panel-3);
    }
</style>
