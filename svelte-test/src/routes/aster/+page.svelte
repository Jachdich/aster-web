<script lang="ts">
	import Message from "../Message.svelte";
	import type { MessageInfo } from "../network";
  import { servers } from "../network";
  let result = servers[0].

  async function init_servers() {
    
  }
  init_servers().then(() => 0);
	// function add_message() {
	// 	messages.push(new MessageInfo("teast ahofhaefhiuj", "KingJellyfish"));
	// 	messages = messages;
	// }
	let messages: Array<MessageInfo> = [];

</script>

<svelte:head>
	<title>Aster</title>
	<meta name="description" content="Aster web client" />
</svelte:head>

<div id="message-area">
	{#each messages as message (message)}
		<Message message={message} />
	{/each}
</div>

<style>
input, textarea, button {
    border: 1px solid #444444;
    border-radius: 6px;
    color: inherit;
    background-color: inherit;
}

:global(body) {
    background-color: #1C1C1C;
    color: #d3d3d3;
    font-family: sans-serif;
}

input:focus {
    outline: none;
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #363636;
    border-radius: 15px;
}

::-webkit-scrollbar-thumb:hover {
    background: #565656;
}

#message-area {
	background-color: #222222;
	display: flex;
  flex-direction: column;
}
</style>
