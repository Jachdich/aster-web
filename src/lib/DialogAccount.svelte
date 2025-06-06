<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";

    import { createEventDispatcher } from "svelte";
    import Dialog from "./Dialog.svelte";
    const dispatch = createEventDispatcher();

    // # ACCOUNT ---------------------------------------------------------------
    export let username: string;
    export let password: string;
    export let pfp: string;
    export let update_settings: (
        uname: string, 
        password: string, 
        pfp: string
    ) => void;

    let pfp_files: FileList | undefined = undefined;
    $: {
        if (pfp_files !== undefined) {
            let item = pfp_files.item(0);
            if (item !== null) {
                // TODO: why is this a promise?
                resize_file(item, 32).then((blob): Promise<void> => 
                    blobToBase64(blob).then((base64): void => {
                        pfp = base64.substr(base64.indexOf(",") + 1);
                    }),
                );
            } else {
                // TODO: show error??
            }
        }
    }

    const blobToBase64 = (blob: Blob): Promise<string> => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                if (typeof reader.result == "string") {
                    resolve(reader.result);
                } else {
                    reject("wrong type/????");
                }
            };
        });
    };
    const resize_file = async (
        file: ImageBitmapSource,
        size: number,
    ): Promise<Blob> => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx == null) {
            return new Promise((_, err) => err("Cannot create 2d context"));
        }

        canvas.width = size;
        canvas.height = size;

        const bitmap = await createImageBitmap(file);
        const { width, height } = bitmap;

        const ratio = Math.max(size / width, size / height);

        const x = (size - width * ratio) / 2;
        const y = (size - height * ratio) / 2;

        ctx.drawImage(
            bitmap,
            0,
            0,
            width,
            height,
            x,
            y,
            width * ratio,
            height * ratio,
        );

        return new Promise((ok, err) => {
            canvas.toBlob(
                (blob) => {
                    if (blob !== null) {
                        ok(blob);
                    } else {
                        err("Could not convert canvas to blob");
                    }
                },
                "image/png",
                1,
            );
        });
    };

    // # DIALOG ----------------------------------------------------------------
    function cancel(_: Event) {
        dispatch("dismiss");
    }
    function accept(_: Event) {
        dispatch("dismiss");
        update_settings(username, password, pfp);
    }
</script>

<Dialog id="account"
        title="{$t('DialogAccount.title')}"
        has_cancel={true} has_close={false} has_accept={true}
        pref_width={400}
        on:dismiss={cancel}
        on:accept={accept}>

        <!-- Profile Picture ----------------------------------------------- -->
        <div class="con-account-pfp">
            <img
                class="gra-account-pfp"
                alt="Profile"
                src="data:image/png;base64,{pfp}"
            />
            <label style="margin-left: auto">
                <input
                    type="file"
                    accept="image/*"
                    style="display: none"
                    bind:files={pfp_files}
                />
                <span class="btn-account-pfp">{$t('dialog.change')}</span>
            </label>
        </div>


        <!-- Account Details ----------------------------------------------- -->
        <div class="con-dialog-row">
            <span>{$t('PageLogin.username')}</span>
            <input bind:value={username} />
        </div>
        <div class="con-dialog-row">
            <span>{$t('PageLogin.password')}</span>
            <input type="password" bind:value={password} />
        </div>

</Dialog>

<style>
    .con-account-pfp {
        width: 30%;
        
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        
        margin: 0 auto;
        
        font-size: var(--font-size-body);
        text-align: center;
    }
    .gra-account-pfp {
        height: 48px;
        width: 48px;
        
        margin-right: 16px;
        
        border-radius: 48px;
    }

    .btn-account-pfp {
        padding: 6px;
        padding-left: 16px;
        padding-right: 16px;
        
        color: var(--white-1);
        background-color: var(--panel-1);
        
        border: 1px none;
        border-radius: 6px;
        
        cursor: pointer;
    }
    .btn-account-pfp:hover {
        background-color: var(--panel-0);
    }
</style>
