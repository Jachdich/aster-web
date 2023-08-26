<script lang="ts">
	import Message from "./Message.svelte";
	const messages = ["A", "B", "C", "D", "E", "F"];
</script>

<svelte:head>
	<title>Aster</title>
	<meta name="description" content="Aster web client" />
</svelte:head>

<div id="message-area">
{#each messages as message}
<Message content="{message}" />
{/each}
</div>

<style>
#message-area {
	background-color: red;
	display: flex;
  flex-direction: column;
}
</style>
