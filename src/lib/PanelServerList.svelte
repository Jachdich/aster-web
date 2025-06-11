<script lang="ts">
    // TODO: unify this and PanelChannelList? idk how though
    // No don't cause now they're both independently toggleable - elecarno
    import type { Server } from "./server";
    import { createEventDispatcher } from 'svelte';
    
    import ServerListButton from "./ServerListButton.svelte";

    // ugly hack: basically so we can store an extra `button`
    // attribute on each channel. One day I'll fix this...
    export let servers: Array<any>;
    const dispatch = createEventDispatcher();
    let selected_server: Server | null = null;
    function switch_server(_: Event, server: Server) {
        if (selected_server === server) {
            dispatch("toggle_current_server");
            return
        }
        for (const serv of servers) {
            if (serv.button != null && serv.server !== server) {
                serv.button.reset();
            }
        }
        selected_server = server;
        dispatch("switch_server", server);
    }
</script>

<div class="con-server-list">
    {#each servers as server (server)}
        <ServerListButton server={server} 
                          on:click={(event) => 
                          switch_server(event, server)} 
                          bind:this={server.button}/>
    {/each}
</div>

<style>
    .con-server-list {
        display: flex;
        flex-direction: column;
    }
</style>
