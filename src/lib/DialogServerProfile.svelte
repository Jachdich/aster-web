<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";
    import Dialog from "./Dialog.svelte";

    // # NETWORKING ------------------------------------------------------------
    import { Server } from "./server";
    export let server: Server;

    function accept(_: Event) {
        // do the things that need to be thing
    }

    // # DIALOG ----------------------------------------------------------------
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }
</script>

<Dialog id="serverprofile"
        title="{$t('DialogServerProfile.title')}: {server.conn.name}"
        has_cancel={true} has_close={false} has_accept={true}
        pref_width={400}
        on:dismiss={cancel}
        on:accept={accept}>

        <!-- Profile Picture ----------------------------------------------- -->
        <div class="con-serverprofile-pfp">
            <img
                class="gra-serverprofile-pfp"
                alt="Profile"
                src="src/assets/aster_logo.png"
            />
            <label style="margin-left: auto">
                <input
                    type="file"
                    accept="image/*"
                    style="display: none"
                />
                <span class="btn-serverprofile-pfp">{$t('dialog.change')}</span>
            </label>
        </div>


        <!-- Profile Details ----------------------------------------------- -->
        <div class="con-dialog-row">
            <span>{$t('DialogServerProfile.nickname')}</span>
            <input/>
        </div>
</Dialog>

<style>
    .con-serverprofile-pfp {
        width: 30%;
        
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        
        margin: 0 auto;
        
        font-size: var(--font-size-body);
        text-align: center;
    }
    .gra-serverprofile-pfp {
        width: 48px;
        height: 48px;
        
        margin-right: 16px;
        
        border-radius: 48px;
    }

    .btn-serverprofile-pfp {
        padding: 6px;
        padding-left: 16px;
        padding-right: 16px;
        
        color: var(--white-1);
        background-color: var(--panel-1);
        
        border: 1px none;
        border-radius: 6px;
    }

    .btn-serverprofile-pfp:hover {
        background-color: var(--panel-0);
    }
</style>
