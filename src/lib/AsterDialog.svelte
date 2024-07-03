<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import aster_logo_wide from "../assets/aster_logo_wide.png";
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }
</script>

<div id="bg-darken">
    <img id="logo" class="pixel-img" src={aster_logo_wide} alt="aster_logo_wide.png">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p style="width: 100%">settings or smth can go here, will probably put themes here actually.</p>
        </div>
        <div class="input-container" style="margin-top: auto">
            <button id="cancel" on:click={cancel}>Close</button>
        </div>
    </div>
</div>

<style>
    #logo {
        position: fixed;
        width: 360px;
        left: calc(50% - 165px);
        top: calc(50% - 360px);
    }

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
        width: 30%;
        min-width: 410px;
        max-width: 500px;
        height: 400px;

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
        width: 100%;
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
