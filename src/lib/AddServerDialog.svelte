<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }

    function ok(_: Event) {
        dispatch("add_server", { ip: ip, port: parseInt(port) });
        dispatch("dismiss");
    }
    function validate_port() {
        port_input.value = port_input.value.replace(/[^0-9]/g, "");
    }
    let ip: string;
    let port: string;
    let port_input: HTMLInputElement;
</script>

<div id="bg-darken">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p id="n_t_ip">IP</p>
            <input id="n_ip" bind:value={ip} />
        </div>
        <div class="input-container">
            <p id="n_t_port">Port</p>
            <input
                id="n_port"
                on:input={validate_port}
                bind:this={port_input}
                bind:value={port}
            />
        </div>
        <div class="input-container">
            <button id="n_cancel" style="margin-right: 5px" on:click={cancel}>Cancel</button>
            <button id="n_ok" style="margin-left: 5px" on:click={ok}>Ok</button>
        </div>
    </div>
</div>


<style>
    #bg-darken {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2 !important;
        display: grid;
        background-color: rgba(0, 0, 0, 0.5);
    }

    #add-server-dialog {
        min-width: 280px;
        min-height: 130px;
        border: 3px solid var(--panel-3);
    }

    .input-container {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        font-size: 15px;
    }

    .input-container p {
        width: 30%;
        margin: 0;
    }

    .input-container input {
        height: 30px;
        padding-left: 10px;
    }

    .input-container button {
        width: 100%;
        height: 30px;
    }

</style>
