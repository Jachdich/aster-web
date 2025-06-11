<script lang="ts">
    import type { Server } from "./server";
    export let server: Server;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    let button: HTMLButtonElement

    function clicked() {
        dispatch("click", { server: server });
        if (button.getAttribute("value") === "0"){
            button.setAttribute("value", "1");
        } else {
            button.setAttribute("value", "0");
        }
    }

    export function reset() {
        button.setAttribute("value", "0");
    }
</script>

<div class="con-btn-server">
    <button class="btn-server" bind:this={button} on:click={clicked}>
        <div class="con-server-name">
            <img
                alt={server.conn.name}
                src="data:image/png;base64,{server.conn.pfp}"
                class="gra-server-icon"
            />
            <p class="lab-server-name">{server.conn.name}</p>
        </div>
        <!-- <p class="lab-server-tagline">[server tagline]</p> -->
    </button>
</div>

<style>
    .con-btn-server {
        width: 100%;
        height: fit-content;
    }

    @media (width >= 1024px) {
        .btn-server {
            width: calc(100% - 10px);
            
            margin: 6px;
            margin-left: 0px;
            
            padding: 10px;
            padding-left: 13px;
            
            background-color: var(--panel-2);
            
            border-top-right-radius: var(--radius-2);
            border-bottom-right-radius: var(--radius-2);
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            
            box-sizing: border-box;
        }
        .btn-server:hover {
            background-color: var(--panel-1);
        }

        .con-server-name {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        .lab-server-name {
            margin: 0;
            margin-left: 10px;
            
            font-size: 18px;
            text-align: left;
        }
        .gra-server-icon {
            height: 48px;
            width: 48px;
            
            border-radius: var(--radius-2);
            
            box-sizing: content-box;
        }

        .lab-server-tagline {
            margin: 0;
            margin-top: 5px;
        }

        button:global(.btn-server[value="0"]) {
            padding-left: 13px;
            border: none;
        }
        button:global(.btn-server[value="1"]) {
            padding-left: 10px;
            border-left: 3px solid var(--accent-1-light);
        }
    }

    @media (width < 1024px) {
        .btn-server {
            height: 57px;
            width: 57px;
            
            margin-bottom: 5px;
            margin-left: 5px;
            
            background-color: var(--panel-2);
            
            border-radius: var(--radius-2);
            
            box-sizing: border-box;
        }

        .con-server-name {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        .lab-server-name {
            display: none;
        }
        .gra-server-icon {
            height: 48px;
            width: 48px;
            
            border-radius: calc(var(--radius-2) - 4px);
            
            box-sizing: content-box;
        }

        .lab-server-tagline {
            display: none;
        }
    }
</style>
