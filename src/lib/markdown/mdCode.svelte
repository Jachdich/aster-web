<script>
    export let lang
    export let text
  </script>
  
<pre class={lang}><code>{text}</code></pre>

<style>
    pre {
        width: 100%;
        background-color: var(--panel-1);
        padding: 16px;
        border-radius: var(--radius-3)
    }

    code {
        font-family: "Red Hat Mono", monospace;
        font-size: 14px;
    }
</style>