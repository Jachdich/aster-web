<script lang="ts">
    // export let content;
    // export let username;
    // export let date;
    // export let img_src;
    export let message;
    let spacing = 8;
    let uname_top = (24 - 20) / 2;
    let body_top = uname_top;
    let date_top = (24 - 10) / 2;
</script>

<div
    class="message"
    style="--spacing: {spacing}px; --uname-top: {uname_top}px; --date-top: {date_top}px; --body-top: {body_top}px;"
>
    <img src="data:image/png;base64,{message.author.pfp}" class="message-pfp" />
    <div class="message-username">{message.author.display_name}</div>
    <div class="message-body">{message.content}</div>
    <div class="message-date">{message.date.toLocaleString()}</div>
</div>

<style>
    .message {
        color: var(--text-gray);
        padding-left: 8px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: stretch;
        margin-top: var(--spacing);
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
        margin-right: 10px;
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