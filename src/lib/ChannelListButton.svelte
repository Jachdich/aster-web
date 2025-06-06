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

<button class="btn-channel"
        on:click={clicked} 
        value="{init_selected ? '1' : '0'}" 
        bind:this={button}>
    {channel.name}
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
    }
    .btn-channel:hover {
        background-color: var(--panel-1);
    }

    button:global(.btn-channel[value="1"]) {
        background-color: var(--panel-3);
    }
</style>
