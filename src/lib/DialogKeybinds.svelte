<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import { t } from "svelte-i18n";
    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }

</script>

<div id="bg-darken">
    <div id="keybinds-dialog" class="popup centre-window">
        <div class="input-container">
            <p id="title">{$t('DialogKeybinds.title')}</p>
        </div>

        
        <!-- Keybinds ------------------------------------------------------ -->
        <div class="keybind">
            <p class="keybind-text" style="">Shift + F1</p>
            <p class="keybind-label" style="">{$t('DialogKeybinds.toggle_sidebar')}</p>
        </div>
        <div class="keybind">
            <p class="keybind-text">Shift + F2</p>
            <p class="keybind-label">{$t('DialogKeybinds.toggle_channels')}</p>
        </div>
        <hr>
        <div class="keybind">
            <p class="keybind-text">Shift + LMB</p>
            <p class="keybind-label">{$t('DialogKeybinds.message_delete')}</p>
        </div>
        <div class="keybind">
            <p class="keybind-text">Ctrl + LMB</p>
            <p class="keybind-label">{$t('DialogKeybinds.message_edit')}</p>
        </div>
        <div class="keybind">
            <p class="keybind-text">Alt + LMB</p>
            <p class="keybind-label">{$t('DialogKeybinds.message_reply')}</p>
        </div>


        <!-- DIALOG -------------------------------------------------------- -->
        <div class="input-container">
            <button id="n_cancel" on:click={close}>{$t('dialog.close')}</button>
        </div>
    </div>
</div>


<style lang="scss">
    #keybinds-dialog {
        min-width: 450px;
        min-height: 150px;
        border-bottom: 3px solid $p-panel-3;
    }

    .keybind {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        font-size: 15px;
        width: 90%; 
        margin: 0 auto; 
        margin-bottom: 16px;
        padding: 0;
    }

    .keybind-text {
        margin-right: auto; width: 50%; margin: 0
    }
    
    .keybind-label {
        margin-left: auto; width: 50%; text-align: right; margin: 0
    }
</style>
