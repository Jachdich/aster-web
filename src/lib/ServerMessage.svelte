<script lang="ts">
    import { is_mobile_width } from '../stores/window_size'
    import { t } from "svelte-i18n";

    // no idea why these exports are here or why they are
    // commented but I'm too afraid to remove them
    // export let content;
    // export let username;
    // export let date;
    // export let img_src;

    // # MARKDOWN --------------------------------------------------------------
    import SvelteMarkdown from "svelte-markdown";
    import mdParagraph from "./markdown/mdParagraph.svelte";
    import mdHTML from "./markdown/mdHTML.svelte";
    import mdHeader from "./markdown/mdHeader.svelte";
    import mdCode from "./markdown/mdCode.svelte";
    import mdCodeSpan from "./markdown/mdCodeSpan.svelte";


    // # CONTEXT MENUS ---------------------------------------------------------
    import { showContextMenu }  from './contextMenuStore';
    
    const conMenu_message = [
        {
            name: 'copy',
            onClick: con_copy,
            displayText: $t('ServerMessage.conMenu_message.copy'),
            class: 'fa-solid fa-copy',
            shortcut: ''
        },
        {
            name: 'reply',
            onClick: con_reply,
            displayText: $t('ServerMessage.conMenu_message.reply'),
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


    // # MESSAGE ---------------------------------------------------------------
    import type { MessageInfo } from "./network";
    import { style } from "./style";

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
    class="con-message"
    style="--spacing: {spacing}px; --uname-top: {uname_top}px; --date-top: {date_top}px; --body-top: {body_top}px; --uname-width: {uname_width}px;"
    on:contextmenu={(e) => showContextMenu(e, conMenu_message)} role="region"
>
    <img src="data:image/png;base64,{message.author.pfp}" 
         alt="{message.author.display_name}'s profile picture" 
         class="gra-message-pfp" />
    {#if !$is_mobile_width}
        <div class="lab-message-username">{message.author.display_name}</div>
    {/if}
    <div class="con-message-body">
        {#if $is_mobile_width}
            <p class="lab-message-username-mobile">{message.author.display_name}</p>
        {/if}
        {#each content_parts as part}
            {#if part.style === "link"}
                <!-- this solution is buggy and doesn't really work -->
                {#if image_urls.length != 0}
                    <!-- I removed the <br> but it still renders somehow..? tf? 
                    Not complaining cause it *works* but like what?-->
                    <a href="{part.text}">{$t('ServerMessage.image_link')}</a>
                {:else}
                    <a href="{part.text}">{part.text}</a>
                {/if}
            {:else}
                <!-- svelte-markdown tries to render HTML as its own thing, 
                 so we can fully sanitize by using a custom renderer -->
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
        <div class="con-message-image">
        {#each image_urls as image_url}
            <img class="gra-message-image" 
                 src={image_url} 
                 alt="embed failed to load"
                 style="display: none;"
                 on:load={show_image} 
                 on:error={
                    (_) => image_urls = image_urls.filter(
                        (url) => url != image_url
                    )
                }>
        {/each}
        </div>
        {#if $is_mobile_width}
            <div class="lab-message-date-mobile">
                {message.date.toLocaleString()}
            </div>
        {/if}
    </div>
    {#if !$is_mobile_width}
        <div class="lab-message-date">
            {message.date.toLocaleString()}
        </div>
    {/if}
</div>

<style>
    .con-message-image {
        display: flex;
        flex-direction: column;
    }

    .gra-message-image {
        max-height: 512px;
        max-width: 60%;
        width: min-content;
        
        object-fit: contain;
    }

    .con-message {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: stretch;
        
        margin-top: var(--spacing);
        
        padding-left: 8px;
        
        color: var(--text-gray);
        
        border-radius: var(--radius-3);
    }
    .con-message:hover {
        background-color: var(--panel-3);
    }

    .lab-message-username {
        min-width: var(--uname-width);
        
        margin: 0;
        margin-top: var(--uname-top);
        margin-left: 10px;
        margin-right: 6px;
        
        font-size: var(--font-size-body);
    }
    
    .lab-message-username-mobile {
        margin: 0;
        margin-top: var(--uname-top);
        margin-left: 10px;
        
        color: var(--text-gray);
        
        font-size: var(--font-size-body);
    }

    .lab-message-date {
        min-width: 130px;

        margin: 0;
        margin-top: var(--date-top);
        margin-left: auto;
        margin-right: 15px;
        
        font-family: var(--font-body-mono);
        font-size: 10px;
        text-align: right;
    }

    .lab-message-date-mobile {
        margin: 0;
        margin-top: var(--date-top);
        
        color: var(--text-gray);
        
        font-family: var(--font-body-mono);
        font-size: 10px;
    }

    .gra-message-pfp {
        height: 24px;
        width: 24px;
        
        margin: 0;
        
        border-style: none;
        border-radius: 50%;
        
        background-position: center;
        object-fit: cover;
    }

    .con-message-body {
        max-width: 100%;
        
        margin: 0;
        margin-top: var(--body-top);
        margin-left: 2px;
        
        color: var(--white-1);
        
        white-space: pre-line;
    }
</style>
