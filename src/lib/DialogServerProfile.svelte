<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";

    // # NETWORKING ------------------------------------------------------------
    import { Server } from "./server";
    export let server: Server;

    function ok(_: Event) {
        // do the things that need to be thing
    }

    // # DIALOG ----------------------------------------------------------------
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }
</script>

<div id="bg-darken">
    <div id="server-profile-dialog" class="popup centre-window">
        <div class="input-container">
            <p id="title">{server.conn.name} - {$t('DialogServerProfile.title')}</p>
        </div>


        <!-- Server Profile ------------------------------------------------ -->
        <div class="input-container">
            <p>{$t('DialogServerProfile.nickname')}</p>
            <input/>
        </div>
        <div class="input-container">
            <p>{$t('DialogServerProfile.avatar')}</p>
            <input/>
        </div>


        <!-- Dialog -------------------------------------------------------- -->
        <div class="input-container" style="margin-top: auto">
            <button id="cancel" 
                    style="margin-right: 5px" 
                    on:click={cancel}>
                {$t('dialog.cancel')}
            </button>
            <button id="ok" 
                    style="margin-left: 5px" 
                    on:click={ok}>
                    {$t('dialog.accept')}
            </button>
        </div>
    </div>
</div>

<style lang="scss">
    #server-profile-dialog {
        color: $p-text-white;
        background-color: $p-panel-2;
        min-width: 280px;
        min-height: 180px;
        border-bottom: 3px solid $p-panel-3;

        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        padding: 15px;
    }
</style>
