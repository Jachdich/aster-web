<script lang="ts">
    // export let content;
    // export let username;
    // export let date;
    // export let img_src;
    
    import type { ServerMessageInfo } from "./network";
    import { style } from "./style";
    export let message: ServerMessageInfo;

    type Style = "link" | "none";
    class StyledText {
        style: Style;
        text: string;
        constructor(style: Style, text: string) {
            this.style = style;
            this.text = text;
        }
    }
    
    let spacing = style.message_spacing;
    let uname_top = (24 - 20) / 2;
    let body_top = uname_top;
    let date_top = (24 - 10) / 2;
    let uname_width = style.justify_username ? 100 : 0;

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

    function show_image(e: Event) {
        if (e.target !== null) {
            if (e.target instanceof HTMLElement) {
                e.target.style.display="block";
            }
        }
    }
</script>

<div
    class="message"
    style="--spacing: {spacing}px; --uname-top: {uname_top}px; --date-top: {date_top}px; --body-top: {body_top}px; --uname-width: {uname_width}px;"
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
            <img class="embed-image" src={image_url} style="display: none;" on:load={show_image} on:error={(_) => image_urls = image_urls.filter((url) => url != image_url)}>
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
        max-height: 512px;
        max-width: 60%;
        width: min-content;
        object-fit: contain;
    }

    .message {
        color: var(--text-gray);
        padding-left: 8px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: stretch;
        margin-top: var(--spacing);
        border-radius: var(--radius-3);
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
        min-width: var(--uname-width);
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
