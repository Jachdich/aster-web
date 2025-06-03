<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { t } from "svelte-i18n";

    import Dialog from "./Dialog.svelte";

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
    function accept(_: Event) {
        dispatch("add_server", { ip: ip, port: parseInt(port) });
        dispatch("dismiss");
    }
</script>

<Dialog id="addserver"
        title="{$t('DialogAddServer.title')}"
        has_cancel={true} has_close={false} has_accept={true}
        on:dismiss={cancel}
        on:accept={accept}>
    <!-- New Server Info ----------------------------------------------- -->
    <div class="con-dialog-row">
        <span id="n_t_ip">{$t('DialogAddServer.ip')}</span>
        <input id="n_ip" bind:value={ip} />
    </div>
    <div class="con-dialog-row">
        <span id="n_t_port">{$t('DialogAddServer.port')}</span>
        <input
            id="n_port"
            on:input={validate_port}
            bind:this={port_input}
            bind:value={port}
        />
    </div>
</Dialog>
