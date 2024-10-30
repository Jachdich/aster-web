<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import snarkdown from "snarkdown";

    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }

    import README from '../../README.md?raw'

    let md = snarkdown(README.replace(/\n/g, '  \n'));

</script>

<div id="bg-darken">
    <div id="changelog-dialog" class="popup centre-window">
        <div class="input-container">
            <p style="font-size: 16px; margin-bottom: 10px; margin-left: auto; margin-right: auto; text-align: center; width: 100%">Changelog</p>
        </div>
        <div id="scroll-box">
            <!-- Yes I know @html is unsafe but svelte-markdown wasn't working and I'm too dumb for mdsvex -->
            <!-- also why tf do I have to double snarkdown() it???? -->
            {@html md}
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

    #changelog-dialog {
        min-width: 450px;
        min-height: 500px;
        max-height: 700px;
        border-bottom: 3px solid var(--panel-3);
    }

    #scroll-box {
        overflow-y: scroll;
        min-height: 400px;
        max-height: 600px
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
