<script lang="ts">
    // export let content;
    // export let username;
    // export let date;
    // export let img_src;

    
    import type { MessageInfo } from "./network";
    export let message: MessageInfo;

    type Style = "link" | "none";
    class StyledText {
        style: Style;
        text: string;
        constructor(style: Style, text: string) {
            this.style = style;
            this.text = text;
        }
    }
    
    let spacing = 8;
    let uname_top = (24 - 20) / 2;
    let body_top = uname_top;
    let date_top = (24 - 10) / 2;

    const url_regex = /https?:\/\/[^\s]+/g;
    let image_urls: string[] = [];
    let content_parts: StyledText[] = [];

    $: parse_message_style(message.content);

    function parse_message_style(content: string) {
        // TODO I think this function is called too many times
        image_urls = [];
        content_parts = [];
        let matches = content.matchAll(url_regex);
        let pos = 0;
        for (const match of matches) {
            if (match.index === undefined) {
                console.log("why is match.index undefined?");
            } else {
                if (match.index != pos) {
                    let prev = content.substring(pos, match.index);
                    content_parts.push(new StyledText("none", prev));
                }
                pos = match.index + match[0].length;
                content_parts.push(new StyledText("link", match[0]));
                image_urls.push(match[0]);
            }
        }
        let prev = content.substring(pos);
        content_parts.push(new StyledText("none", prev));
        content_parts = content_parts;
        image_urls = image_urls;
    }
</script>

<div
    class="message"
    style="--spacing: {spacing}px; --uname-top: {uname_top}px; --date-top: {date_top}px; --body-top: {body_top}px;"
>
    <img src="data:image/png;base64,{message.author.pfp}" alt="{message.author.display_name}'s profile picture" class="message-pfp" />
    <div class="message-username">{message.author.display_name}</div>
    <div class="message-body">
        {#each content_parts as part}
            {#if part.style === "link"}
                <a href="{part.text}">{part.text}</a>
            {:else}
                {part.text}
            {/if}
        {/each}
        <div class="image-container">
        {#each image_urls as image_url}
            <img class="embed-image" src={image_url} on:error={(_) => image_urls = image_urls.filter((url) => url != image_url)}>
        {/each}
        </div>
    </div>
    <div class="message-date">{message.date.toLocaleString()}</div>
</div>

<style>
    .image-container {
        display: flex;
        flex-direction: column;
    }

    .embed-image {
        width: 60%;
    }

    .message {
        color: var(--text-gray);
        padding-left: 8px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: stretch;
        margin-top: var(--spacing);
        border-radius: 8px;
    }

    .message:hover {
        background-color: var(--panel-3);
    }

    .message-username {
        margin: 0;
        margin-left: 10px;
        margin-right: 6px;
        font-size: 15px;
        margin-top: var(--uname-top);
        min-width: 100px; /* might not keep */
    }

    .message-date {
        margin: 0;
        margin-left: 5px;
        font-size: 10px;
        margin-top: var(--date-top);
        margin-left: auto;
        margin-right: 15px;
        min-width: 130px;
        text-align: right;
        font-family: "Red Hat Mono", monospace;
    }

    .message-pfp {
        margin: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border-style: none;
        background-position: center;
        object-fit: cover;
    }

    .message-body {
        margin: 0;
        color: var(--white-1);
        margin-left: 2px;
        margin-top: var(--body-top);
        white-space: pre-line;
    }

</style>
