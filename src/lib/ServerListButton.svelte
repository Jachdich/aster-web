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

<div id="con-btn-server">
    <button id="btn-server" bind:this={button} on:click={clicked}>
        <div id="con-server-name">
            <img
                alt={server.conn.name}
                src="data:image/png;base64,{server.conn.pfp}"
                id="gra-server-icon"
            />
            <p id="lab-server-name">{server.conn.name}</p>
        </div>
        <p id="lab-server-tagline">[server tagline]</p>
    </button>
</div>

<style>
    #con-btn-server {
        width: 100%;
        height: fit-content;
    }

    @media (width >= 1024px) {
        #btn-server {
            background-color: var(--panel-2);
            border-radius: var(--radius-2);
            width: calc(100% - 20px);
            margin: 10px;
            padding: 10px;
            padding-left: 13px;
            box-sizing: border-box;
        }
        #btn-server:hover {
            background-color: var(--panel-1);
        }

        #con-server-name {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        #lab-server-name {
            margin: 0;
            margin-left: 10px;
            font-size: 18px;
            text-align: left;
        }
        #gra-server-icon {
            box-sizing: content-box;
            width: 48px;
            height: 48px;
            border-radius: var(--radius-2);
        }

        #lab-server-tagline {
            margin: 0;
            margin-top: 5px;
        }

        button:global(#btn-server[value="0"]) {
            border: none;
            padding-left: 13px;
        }
        button:global(#btn-server[value="1"]) {
            border-left: 3px solid var(--accent-1-light);
            padding-left: 10px;
        }
    }

    @media (width < 1024px) {
        #btn-server {
            background-color: var(--panel-2);
            border-radius: var(--radius-2);
            width: 57px;
            height: 57px;
            margin-left: 5px;
            margin-bottom: 5px;
            box-sizing: border-box;
        }

        #con-server-name {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        #lab-server-name {
            display: none;
        }
        #gra-server-icon {
            box-sizing: content-box;
            width: 48px;
            height: 48px;
            border-radius: calc(var(--radius-2) - 4px);
        }

        #lab-server-tagline {
            display: none;
        }
    }
</style>
