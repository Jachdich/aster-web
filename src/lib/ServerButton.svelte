<script lang="ts">
    import type { Server } from "./server";
    export let server: Server;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    let button: HTMLElement;

    function clicked() {
        dispatch("click", { server: server });
        button.setAttribute("value", "1");
    }

    export function reset() {
        button.setAttribute("value", "0");
    }
</script>

<div class="outer">
    <button class="server-button" on:click={clicked}>
        <img
            alt={server.conn.name}
            src="data:image/png;base64,{server.conn.pfp}"
            class="server-icon"
        />
        <span class="circle" bind:this={button} value="0"></span>
        <p class="name">{server.conn.name}</p>
    </button>
</div>

<style>
    .outer {
        width: 80px;
        height: fit-content;
    }
    .name {
        margin: 0;
        grid-row: 2;
        grid-column: 1;
    }
    .server-button {
        background-color: inherit;
        color: inherit;
        text-align: left;
        border-radius: 0;
        display: inline;
        border: 0;
        box-sizing: content-box;
        display: grid;
        margin: 0 auto;
    }

    .circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: #444444;
        z-index: 1;
        grid-row: 1;
        grid-column: 1;
        margin: 0 auto;
    }

    .server-icon {
        box-sizing: content-box;
        width: 48px;
        height: 48px;
        border: 4px solid #ff000000;
        display: inline;
        margin: 0 auto;
        z-index: 2;
        grid-row: 1;
        grid-column: 1;
    }
    span:global(.circle[value="0"]) {
        display: none;
    }
    span:global(.circle[value="1"]) {
        display: inline-block;
    }
</style>
