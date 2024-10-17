<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }

</script>

<div id="bg-darken">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p style="font-size: 16px; margin-bottom: 10px; margin-left: auto; margin-right: auto; text-align: center">Keybinds</p>
        </div>
        <div class="keybind">
            <p style="margin-right: auto; width: 50%; margin: 0">Shift + F1</p>
            <p style="margin-left: auto; width: 50%; text-align: right; margin: 0">Toggle Sidebar</p>
        </div>
        <div class="keybind">
            <p style="margin-right: auto; width: 50%; margin: 0">Shift + F2</p>
            <p style="margin-left: auto; width: 50%; text-align: right; margin: 0">Toggle Server Info</p>
        </div>
        <div style="margin: 0 auto; width: 95%; height: 3px; background-color: var(--panel-3); margin-bottom: 16px; border-radius: 1.5px"></div>
        <div class="keybind">
            <p style="margin-right: auto; width: 50%; margin: 0">Shift + LMB</p>
            <p style="margin-left: auto; width: 50%; text-align: right; margin: 0">Delete Message</p>
        </div>
        <div class="keybind">
            <p style="margin-right: auto; width: 50%; margin: 0">Ctrl + LMB</p>
            <p style="margin-left: auto; width: 50%; text-align: right; margin: 0">Edit Message</p>
        </div>
        <div class="keybind">
            <p style="margin-right: auto; width: 50%; margin: 0">LMB (Double)</p>
            <p style="margin-left: auto; width: 50%; text-align: right; margin: 0">Reply to Message</p>
        </div>
        <div class="input-container">
            <button id="n_cancel" on:click={close}>Close</button>
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
        min-height: 150px;
        border-bottom: 3px solid var(--panel-3);
    }

    .input-container {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        font-size: 15px;
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

    .input-container p {
        width: 30%;
        margin: 0;
    }

    .input-container button {
        width: 100%;
        height: 30px;
    }

</style>
