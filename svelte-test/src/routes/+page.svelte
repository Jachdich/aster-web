<script lang="ts">
	import Message from "./Message.svelte";
	class MessageInfo {
		content: string;
		username: string;
		constructor(content: string, username: string) {
			this.username = username;
			this.content = content;
		}
	}
	const messages = [new MessageInfo("Test message 1", "KingJellyfish"), new MessageInfo("Very good observation james", "ConnorCole01"), new MessageInfo("beans", "Elecarno")];
</script>

<svelte:head>
	<title>Aster</title>
	<meta name="description" content="Aster web client" />
</svelte:head>

<div id="message-area">
{#each messages as message}
<Message message={message} />
{/each}
</div>

<style>
#message-area {
	background-color: #222222;
	display: flex;
  flex-direction: column;
}
</style>
