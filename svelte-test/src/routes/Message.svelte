<script lang="ts">
	// export let content;
	// export let username;
	// export let date;
	// export let img_src;
  export let message;
	</script>

<div class="message">
	<img src="data:image/png;base64,{message.author.pfp}" class="message-pfp"/>
	<div class="message-username">{message.author.display_name}</div>
	<div class="message-body">{message.content}</div>
	<div class="message-date">{message.date.toLocaleString()}</div>
</div>

<style>
.message {
    color: #929292;
    padding-left: 8px;
    display: flex;
    flex-direction: row;
    margin-top: 12px;
}

.message-username {
    margin: 0;
    margin-left: 10px;
    margin-right: 6px;
    margin-top: 5px;
}

.message-date {
    margin: 0;
    margin-left: 5px;
    font-size: 10px;
    margin-top: 8px;
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
    color: #d3d3d3;
    margin-left: 2px;
    margin-top: 5px;
}
</style>
