<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import { t } from "svelte-i18n";

    // # VALIDATION ------------------------------------------------------------
    let ip: string;
    let port: string;
    let port_input: HTMLInputElement;
    function validate_port() {
        port_input.value = port_input.value.replace(/[^0-9]/g, "");
    }


    // # DIALOG ----------------------------------------------------------------
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }
    function ok(_: Event) {
        dispatch("add_server", { ip: ip, port: parseInt(port) });
        dispatch("dismiss");
    }
</script>

<div id="bg-darken">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p id="title">{$t('DialogAddServer.title')}</p>
        </div>
        <!-- New Server Info -->
        <div class="input-container">
            <p id="n_t_ip">{$t('DialogAddServer.ip')}</p>
            <input id="n_ip" bind:value={ip} />
        </div>
        <div class="input-container">
            <p id="n_t_port">{$t('DialogAddServer.port')}</p>
            <input
                id="n_port"
                on:input={validate_port}
                bind:this={port_input}
                bind:value={port}
            />
        </div>
        <!-- Dialog -->
        <div class="input-container">
            <button id="n_cancel" 
                    style="margin-right: 5px" 
                    on:click={cancel}>
                {$t('dialog.cancel')}
            </button>
            <button id="n_ok" 
                    style="margin-left: 5px" 
                    on:click={ok}>
                {$t('dialog.accept')}
            </button>
        </div>
    </div>
</div>

<style>
    #add-server-dialog {
        min-width: 280px;
        min-height: 150px;
        border-bottom: 3px solid var(--panel-3);
    }
</style>
