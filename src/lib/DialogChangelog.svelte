<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import snarkdown from "snarkdown";

    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }

    import README from '../../README.md?raw'
    import Dialog from "./Dialog.svelte";

    // TODO: Replace with svelte-markdown at some point
    // Although is that really necessary?
    // Snarkdown being more lightweight works for this but
    // its also a whole other dependency for only one dialog
    let md = snarkdown(README.replace(/\n/g, '  \n'));

</script>

<Dialog id="changelog"
        title="Changelog"
        pref_width={450}
        on:dismiss={close}>
        <div id="con-changelog-scrollbox">
            {@html md}
        </div>
</Dialog>

<style>
    #con-changelog-scrollbox {
        overflow-y: scroll;
        min-height: 400px;
        max-height: 600px
    }
</style>
