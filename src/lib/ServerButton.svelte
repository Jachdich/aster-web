<script lang="ts">
    import type { Server } from "./server";
    export let server: Server;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    let button: HTMLButtonElement

    function clicked() {
        dispatch("click", { server: server });
        button.setAttribute("value", "1");
    }

    export function reset() {
        button.setAttribute("value", "0");
    }
</script>

<div class="outer">
    <button class="server-button" bind:this={button} on:click={clicked}>
        <div id="title-block">
            <img
                alt={server.conn.name}
                src="data:image/png;base64,{server.conn.pfp}"
                class="server-icon"
            />
            <p class="name">{server.conn.name}</p>
        </div>
        <div class="separator" style="width: 90%; margin-top: 7px; margin-bottom: 7px"></div>
        <p id="server-tagline">A cool Aster server</p>
        <p id="server-info">[msgs] / 7 days</p>
        
    </button>
</div>

<style>
    .outer {
        width: 100%;
        height: fit-content;
    }
    .server-button {
        background-color: var(--panel-2);
        border-radius: var(--radius-2);
        width: calc(100% - 20px);
        margin: 10px;
        padding: 10px;
        padding-left: 13px;
        box-sizing: border-box;
    }
    .server-button:hover {
        background-color: var(--panel-1);
    }

    #title-block {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .name {
        margin: 0;
        margin-left: 10px;
        font-size: 18px;
        text-align: left;
    }
    .server-icon {
        box-sizing: content-box;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-2);
    }

    #server-tagline {
        text-align: left;
        margin: 0;
        margin-top: 5px;
    }
    #server-info {
        color: var(--text-gray);
        font-size: 14px;
        margin: 0;
        margin-top: 3px;
    }

    button:global(.server-button[value="0"]) {
        border: none;
        padding-left: 13px;
    }
    button:global(.server-button[value="1"]) {
        border-left: 3px solid var(--accent-1-light);
        padding-left: 10px;
    }
</style>
