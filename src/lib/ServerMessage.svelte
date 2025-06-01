<script lang="ts">
    import { parse } from "svelte/compiler";

    // export let content;
    // export let username;
    // export let date;
    // export let img_src;
    
    // this really shouldn't exist on every single message but help me god its 23:12 and I am running
    // out of time so deal with it
    let innerWidth = 0
    let innerHeight = 0
    
    $: is_mobile_width = innerWidth <= 1024 // using this for now to align with the media query css styles

    import type { MessageInfo } from "./network";
    import { style } from "./style";
    // import snarkdown from "snarkdown";
    import SvelteMarkdown from "svelte-markdown";
    import mdParagraph from "./markdown/mdParagraph.svelte";
    import mdHTML from "./markdown/mdHTML.svelte";
    import mdHeader from "./markdown/mdHeader.svelte";
    import mdCode from "./markdown/mdCode.svelte";
    import mdCodeSpan from "./markdown/mdCodeSpan.svelte";
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

    import { showContextMenu }  from './contextMenuStore';

    // CONTEXT MENUS
    const message_conMenu = [
        {
            name: 'copy',
            onClick: con_copy,
            displayText: 'Copy',
            class: 'fa-solid fa-copy',
            shortcut: ''
        },
        {
            name: 'reply',
            onClick: con_reply,
            displayText: 'Reply',
            class: 'fa-solid fa-reply',
            shortcut: 'Alt+LMB'
        },
    ];

    function con_copy() {
        navigator.clipboard.writeText(message.content)
    }
    function con_reply(){
        // james this is for you probably lol
    }
    // CONTEXT MENUS ^^
    
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

<svelte:window bind:innerWidth bind:innerHeight />

<div
    class="message"
    style="--spacing: {spacing}px; --uname-top: {uname_top}px; --date-top: {date_top}px; --body-top: {body_top}px; --uname-width: {uname_width}px;"
    on:contextmenu={(e) => showContextMenu(e, message_conMenu)} role="region"
>
    <img src="data:image/png;base64,{message.author.pfp}" alt="{message.author.display_name}'s profile picture" class="message-pfp" />
    {#if !is_mobile_width}
        <div class="message-username">{message.author.display_name}</div>
    {/if}
    <div class="message-body">
        {#if is_mobile_width}
            <p class="message-username-mobile">{message.author.display_name}</p>
        {/if}
        {#each content_parts as part}
            {#if part.style === "link"}
                <!-- this solution is buggy and doesn't really work -->
                {#if image_urls.length != 0}
                    <!-- I removed the <br> but it still renders somehow..? tf? Not complaining cause it *works* but like what?-->
                    <a href="{part.text}">image link</a>
                {:else}
                    <a href="{part.text}">{part.text}</a>
                {/if}
            {:else}
                <!-- svelte-markdown tries to render HTML as its own thing, so we can fully sanitize by using a custom renderer -->
                <SvelteMarkdown 
                    source={part.text}
                    renderers={{
                        paragraph: mdParagraph, 
                        html: mdHTML,
                        heading: mdHeader,
                        code: mdCode,
                        codespan: mdCodeSpan
                    }}
                />
            {/if}
        {/each}
        <div class="image-container">
        {#each image_urls as image_url}
            <img class="embed-image" src={image_url} style="display: none;" on:load={show_image} on:error={(_) => image_urls = image_urls.filter((url) => url != image_url)}>
        {/each}
        </div>
        {#if is_mobile_width}
            <div class="message-date-mobile">{message.date.toLocaleString()}</div>
        {/if}
    </div>
    {#if !is_mobile_width}
        <div class="message-date">{message.date.toLocaleString()}</div>
    {/if}
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
    
    .message-username-mobile {
        color: var(--text-gray);
        margin: 0;
        margin-left: 10px;
        /* margin-right: 6px; */
        font-size: 15px;
        margin-top: var(--uname-top);
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

    .message-date-mobile {
        color: var(--text-gray);
        margin: 0;
        font-size: 10px;
        margin-top: var(--date-top);
        /* margin-left: 10px; */
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
        max-width: 100%;
    }

    .message-body h1 {
        margin: 0;
    }
</style>
