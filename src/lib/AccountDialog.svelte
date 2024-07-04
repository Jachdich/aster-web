<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let username: string;
    export let password: string;
    export let pfp: string;
    export let update_settings: (uname: string, password: string, pfp: string) => void;

    let pfp_files: FileList = new FileList();
    $: {
        let item = pfp_files.item(0);
        if (item !== null) {
            resize_file(item, 32).then((blob): Promise<void> => // TODO why is this a promise?
                blobToBase64(blob).then((base64): void => {
                    pfp = base64.substr(base64.indexOf(",") + 1);
                }),
            );
        } else {
            // TODO show error??
        }
    }

    function cancel(_: Event) {
        dispatch("dismiss");
    }

    function ok(_: Event) {
        dispatch("dismiss");
        update_settings(username, password, pfp);
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
</script>

<div id="bg-darken">
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p
                style="font-size: 16px; margin-bottom: 10px; margin-left: auto; margin-right: auto; text-align: center"
            >
                Account
            </p>
        </div>
        <div class="input-container">
            <p>Username</p>
            <input bind:value={username} />
        </div>
        <div class="input-container">
            <p>Password</p>
            <input type="password" bind:value={password} />
        </div>
        <div class="input-container">
            <p style="margin-right: 16px">Profile&nbspPicture</p>
            <img
                id="pfp-image"
                alt="Profile"
                src="data:image/png;base64,{pfp}"
            />
            <label>
                <input
                    type="file"
                    accept="image/*"
                    id="pfp-button"
                    style="display: none"
                    bind:files={pfp_files}
                />
                <span id="file-button">Change</span>
            </label>
        </div>
        <div class="input-container" style="margin-top: auto">
            <button id="cancel" style="margin-right: 5px" on:click={cancel}
                >Cancel</button
            >
            <button id="ok" style="margin-left: 5px" on:click={ok}>Ok</button>
        </div>
    </div>
</div>

<style>
    #file-button {
        border: 1px none;
        border-radius: 6px;
        color: var(--white-1);
        background-color: var(--panel-1);
        cursor: pointer;
        padding: 6px;
        padding-left: 16px;
        padding-right: 16px;
    }

    #file-button:hover {
        background-color: var(--panel-0);
    }

    #pfp-image {
        width: 48px;
        height: 48px;
        border-radius: 48px;
        margin-right: 16px;
    }

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

    #add-server-dialog {
        color: var(--white-1);
        background-color: var(--panel-2);
        min-width: 280px;
        min-height: 150px;
        border-bottom: 3px solid var(--panel-3);

        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        padding: 15px;
    }

    .input-container {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        font-size: 15px;
    }

    .input-container p {
        width: 30%;
        margin: 0;
    }

    .input-container input {
        height: 30px;
        padding-left: 10px;
    }

    .input-container button {
        width: 100%;
        height: 30px;
    }
</style>
