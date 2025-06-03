<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";
    import Dialog from "./Dialog.svelte";

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }

</script>

<Dialog id="keybinds"
        title="{$t('DialogKeybinds.title')}"
        pref_width={350}
        on:dismiss={close}>
    <!-- Keybinds ------------------------------------------------------ -->
    <div class="con-dialog-row">
        <span >{$t('DialogKeybinds.toggle_sidebar')}</span>
        <p class="lab-keybind">Shift + F1</p>
    </div>
    <div class="con-dialog-row">
        <span>{$t('DialogKeybinds.toggle_channels')}</span>
        <p class="lab-keybind">Shift + F2</p>
    </div>
    <hr>
    <div class="con-dialog-row">
        <span>{$t('DialogKeybinds.message_delete')}</span>
        <p class="lab-keybind">Shift + LMB</p>
    </div>
    <div class="con-dialog-row">
        <span>{$t('DialogKeybinds.message_edit')}</span>
        <p class="lab-keybind">Ctrl + LMB</p>
    </div>
    <div class="con-dialog-row">
        <span>{$t('DialogKeybinds.message_reply')}</span>
        <p class="lab-keybind">Alt + LMB</p>
    </div>
</Dialog>

<style>
    .lab-keybind { 
        width: 60%; 
        text-align: right; 
        margin: 0
    }
</style>
