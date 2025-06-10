<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { t } from "svelte-i18n";

    import Dialog from "./Dialog.svelte";

    export let img_url: string

    // # DIALOG ----------------------------------------------------------------
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
        img_url = "";
    }
</script>

<Dialog id="image"
        title="{$t('DialogAddServer.title')}"
        has_title={false}
        has_cancel={false} has_close={false} has_accept={false}
        on:dismiss={cancel}>
    <!-- New Server Info ----------------------------------------------- -->
    <img class="gra-dialogimage-img"
    src={img_url} alt="img">
</Dialog>

<style>
    .gra-dialogimage-img {
        height: 100%;
        width: 100%;
    }
</style>


