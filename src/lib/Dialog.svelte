<script lang="ts">
    import { t } from "svelte-i18n";
    import { aster_logo_wide } from "./logos";

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let id = "none"
    export let title = "Title"
    export let bg_dismiss:  boolean = true
    export let has_title:   boolean = true
    export let has_close:   boolean = true
    export let has_cancel:  boolean = false
    export let has_accept:  boolean = false
    export let has_logo:    boolean = false
    export let pref_width = 300; //allows to set the preferred width of the dialog

    function bg_close(_: Event) {
        if (bg_dismiss){
            dispatch("dismiss");
        }
    }
    function close(_: Event) {
        dispatch("dismiss");
    }
    function accept(_: Event) {
        dispatch("accept");
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="pan-bg-darken" on:click={bg_close}>
    {#if has_logo}
    <svg id="gra-logo" 
        class="pixel-img" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        fill="currentColor">
        <path stroke="var(--accent-1-light)" d={aster_logo_wide}/>
    </svg>
    {/if}

    <!-- note: 20px is subtracted from the pref_width 
            because it has 10px padding -->
    <div id="pan-dialog-{id}" class="pan-dialog"
        style="--prefwidth: {pref_width - 20}px; z-index: 3"
        on:click|stopPropagation>
        {#if has_title}
            <p id="lab-dialog-title">{title}</p>
            <hr>
        {/if}

        <div class="con-dialog-content">
            <slot/>
        </div>

        <!-- Dialog Buttons ------------------------------------------------ -->
        <div class="con-dialog-buttons" style="margin-top: auto">
            {#if has_close}
                <button id="btn-close" class="btn-dialog-exit" 
                        on:click={close}>
                    {$t('dialog.close')}
                </button>
            {/if}
            {#if has_cancel}
                <button id="btn-cancel" class="btn-dialog-exit"
                on:click={close}>
                    {$t('dialog.cancel')}
                </button>
            {/if}
            {#if has_accept}
                <button id="btn-accept" class="btn-dialog-exit" 
                on:click={accept}>
                    {$t('dialog.accept')}
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    #pan-bg-darken {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2 !important;
        display: grid;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    #gra-logo {
        width: 360px;
        margin-bottom: 128px;
    }

    .pan-dialog {
        display: grid;
        padding: 10px;
        border-bottom: 3px solid var(--panel-3);
        background-color: var(--panel-2);
        border-radius: var(--radius-3);;
        position: absolute;
        
        width: clamp(250px, var(--prefwidth), 85%);

        /* left: 50%;
        right: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%); */
    }

    .con-dialog-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        row-gap: 5px;
    }

    #lab-dialog-title {
        font-size: 18px;
        margin-bottom: 10px; 
        margin-left: auto; 
        margin-right: auto; 
        margin-top: 4px;
        text-align: center
    }

    .con-dialog-buttons {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 36px;
        padding-top: 14px;
        column-gap: 5px;
    }

    .btn-dialog-exit {
        height: 100%;
        width: 100%;
        font-size: var(--font-size-body);
    }
</style>