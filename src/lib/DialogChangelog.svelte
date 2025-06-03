<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import snarkdown from "snarkdown";

    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }

    import README from '../../README.md?raw'

    // TODO: Replace with svelte-markdown at some point
    // Although is that really necessary?
    // Snarkdown being more lightweight works for this but
    // its also a whole other dependency for only one dialog
    let md = snarkdown(README.replace(/\n/g, '  \n'));

</script>

<div id="bg-darken">
    <div id="changelog-dialog" class="popup centre-window">
        <div class="input-container">
            <p id="title">Changelog</p>
        </div>
        <div id="scroll-box">
            {@html md}
        </div>
        <div class="input-container">
            <button id="n_cancel" on:click={close}>Close</button>
        </div>
    </div>
</div>

<style lang="scss">
    #changelog-dialog {
        min-width: 450px;
        min-height: 500px;
        max-height: 700px;
        border-bottom: 3px solid $p-panel-3;
    }

    #scroll-box {
        overflow-y: scroll;
        min-height: 400px;
        max-height: 600px
    }
</style>
