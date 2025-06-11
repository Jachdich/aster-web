<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import { t } from "svelte-i18n";

    import Dialog from "./Dialog.svelte";
    import type { Peer } from "./network";

    export let known_peers: Map<number, Peer>;

    // # CON MENU --------------------------------------------------------------
    import { showContextMenu }  from './contextMenuStore';

    function show_member_conMenu (e: any, id: any) {
        selected_uuid = id
        showContextMenu(e, conMenu_member)
        console.log(id)
    }

    let selected_uuid: string

    const conMenu_member = [
        {
            name: 'copy_uuid',
            onClick: con_copy_uuid,
            displayText: $t('DialogMemberList.copy_uuid'),
            class: 'fa-solid fa-copy',
            shortcut: ''
        }
    ];
    function con_copy_uuid(){
        navigator.clipboard.writeText(selected_uuid)
    }

    // # DIALOG ----------------------------------------------------------------
    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }
</script>

<Dialog id="memberlist"
        title="{$t('PanelServerView.server_info.members')}: {known_peers.size}" 
        pref_width={450}
        on:dismiss={close}>
        <div class="con-memberlist-scrollbox">
            {#each Array.from(known_peers.entries()) as [id, peer]}
            <div class="con-memberlist-member"
                 on:contextmenu={(e) => (
                    show_member_conMenu(e, id)
                )}
                 role="button" tabindex=0>
                <img
                    class="gra-memberlist-pfp"
                    alt="pfp"
                    src="data:image/png;base64,{peer.pfp}"
                />
                <p class="lab-memberlist-displayname">{peer.display_name}</p>
            </div>
            {/each}
        </div>
</Dialog>

<style>
    .con-memberlist-scrollbox {
        min-height: 400px;
        max-height: 600px;
        width: 95%;

        margin: 0 auto;
        
        overflow-y: scroll;
    }
    .con-memberlist-member {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        column-gap: 16px;

        margin-bottom: 10px;

        border-radius: var(--radius-3);
    }
    .con-memberlist-member:hover {
        background-color: var(--panel-3);
    }

    .gra-memberlist-pfp {
        height: 32px;
        width: 32px;

        border-radius: 50%;
    }
    
    .lab-memberlist-displayname {
        margin: 0;
    }
</style>
