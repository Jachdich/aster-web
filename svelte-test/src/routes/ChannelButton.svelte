<script lang="ts">
    export let channel;
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let button;
    
    function clicked() {
        console.log("Channel " + channel.name + " clicked");
        button.setAttribute("value", "1");
        dispatch("click", {"channel": channel});
    }

    export function reset() {
        button.setAttribute("value", "0");
    }
</script>

<button class="channel-button" on:click={clicked} value="0" bind:this={button}>{channel.name}</button>

<style>
.channel-button {
    box-sizing: border-box;
    list-style-type: none;
    border: none;
    background-color: inherit;
    color: inherit;
    width: 96%;
    text-align: left;
    border-radius: 0;
}

button:global(.channel-button[value="1"]) {
    border-left: 4px solid white;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

button:global(.channel-button[value="0"]) {
    margin-left: 4px;
    border-radius: 0;
}
</style>