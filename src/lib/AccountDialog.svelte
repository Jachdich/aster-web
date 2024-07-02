<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }

    function ok(_: Event) {
        // do the things that need to be thing
    }
</script>

<div id="bg-darken">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p style="font-size: 16px; margin-bottom: 10px; margin-left: auto; margin-right: auto; text-align: center">Account</p>
        </div>
        <div class="input-container">
            <p>Username</p>
            <input/>
        </div>
        <div class="input-container" style="margin-top: auto">
            <button id="cancel" style="margin-right: 5px" on:click={cancel}>Cancel</button>
            <button id="ok" style="margin-left: 5px" on:click={ok}>Ok</button>
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
        color: var(--white-1);
        background-color: var(--panel-2);
        min-width: 280px;
        min-height: 150px;
        border-bottom: 3px solid var(--panel-3);

        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        padding: 15px;
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
