<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { t } from "svelte-i18n";

    import Dialog from "./Dialog.svelte";

    export let img_url: string

    let dynamic_width = 800;

    function update_width() {
        const img = new Image();
        img.onload = () => {
            dynamic_width = Math.min(img.width, 1300); // +40 for padding/margin
        };
        img.src = img_url;
    }

    $: img_url && update_width();

    // # BUTTONS ---------------------------------------------------------------
    function img_link_copy() {
        navigator.clipboard.writeText(img_url)
    }
    function img_open_tab(){
        window.open(img_url, '_blank', 'noopener,noreferrer');
    }

    // # DIALOG ----------------------------------------------------------------
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }
</script>

<Dialog id="image"
        title="{$t('DialogAddServer.title')}"
        has_title={false}
        has_cancel={false} has_close={false} has_accept={false}
        pref_width={dynamic_width}
        on:dismiss={cancel}>
    <!-- New Server Info ----------------------------------------------- -->
    <div class="con-image-img">
        <img class="gra-image-img"
        src={img_url} alt="img">
    </div>
    
    <div class="con-dialog-row" style="column-gap: 8px;">
        <button on:click={img_open_tab}>
            Open In New Tab</button>
        <button on:click={img_link_copy}>
            Copy Image Link</button>
    </div>
</Dialog>

<style>
    .con-image-img {
        max-height: 100%;
        max-width: 100%;

        display: flex;
        align-items: center;
        justify-content: center;

        overflow: hidden;
    }
    .gra-image-img {
        max-height: 100%;
        max-width: 100%;
        height: auto;
        width: auto;
        
        margin-bottom: var(--margin-2);

        border-radius: var(--radius-3);

        object-fit: contain;
    }
</style>


