<script lang="ts">
    // TODO: unify this and ChannelList? idk how though
    import type { Connection } from "./network";
    import { createEventDispatcher } from 'svelte';
    import ServerButton from "./ServerButton.svelte";

    // ugly hack: basically so we can store an extra `button` attribute on each channel. One day I'll fix this...
    export let servers: Array<any>;
    const dispatch = createEventDispatcher();
    let selected_server: Connection | null = null;
    function switch_server(_: Event, server: Connection) {
        if (selected_server === server) {
            return;
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

<ul id="server-list">
    {#each servers as server (server)}
        <ServerButton server={server} on:click={(event) => switch_server(event, server)} bind:this={server.button} />
    {/each}
</ul>

<style>
#server-list {
    display: flex;
    flex-direction: column;
}
</style>
