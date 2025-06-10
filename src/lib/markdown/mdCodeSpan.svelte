<script>
  export let raw
</script>

<code>{raw.replace(/`/g, '')}</code>

<style>
    code {
        font-family: "Red Hat Mono", monospace;
        font-size: 14px;
        background-color: var(--panel-1);
        padding: 5px;
        border-radius: var(--radius-3)
    }
</style>