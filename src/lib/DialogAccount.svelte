<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";

    import { createEventDispatcher } from "svelte";
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
    function ok(_: Event) {
        dispatch("dismiss");
        update_settings(username, password, pfp);
    }
</script>

<div id="bg-darken">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p id="title">{$t('DialogAccount.title')}</p>
        </div>


        <!-- Profile Picture ----------------------------------------------- -->
        <div class="input-container" 
             style="margin: 0 auto; margin-bottom: 16px;">
            <img
                id="pfp-image"
                alt="Profile"
                src="data:image/png;base64,{pfp}"
            />
            <label style="margin-left: auto">
                <input
                    type="file"
                    accept="image/*"
                    id="pfp-button"
                    style="display: none"
                    bind:files={pfp_files}
                />
                <span id="file-button">{$t('dialog.change')}</span>
            </label>
        </div>


        <!-- Account Details ----------------------------------------------- -->
        <div class="input-container" style="margin-bottom: 8px;">
            <p>{$t('PageLogin.username')}</p>
            <input bind:value={username} />
        </div>
        <div class="input-container" style="margin-bottom: 16px;">
            <p>{$t('PageLogin.password')}</p>
            <input type="password" bind:value={password} />
        </div>


        <!-- Dialog Buttons ------------------------------------------------ -->
        <div class="input-container" style="margin-top: auto">
            <button id="cancel" style="margin-right: 5px" 
                    on:click={cancel}>
                {$t('dialog.cancel')}
            </button>
            <button id="ok" style="margin-left: 5px" 
                    on:click={ok}>
                {$t('dialog.accept')}
            </button>
        </div>
    </div>
</div>

<style lang="scss">
    #file-button {
        border: 1px none;
        border-radius: 6px;
        color: $p-text-white;
        background-color: $p-panel-1;
        cursor: pointer;
        padding: 6px;
        padding-left: 16px;
        padding-right: 16px;
    }

    #file-button:hover {
        background-color: $p-panel-0;
    }

    #pfp-image {
        width: 48px;
        height: 48px;
        border-radius: 48px;
        margin-right: 16px;
    }

    #add-server-dialog {
        color: $p-text-white;
        background-color: $p-panel-2;
        min-width: 280px;
        min-height: 150px;
        border-bottom: 3px solid $p-panel-3;

        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        padding: 15px;
    }
</style>
