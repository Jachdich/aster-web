<script>
//   import { getContext } from 'svelte'
//   import { key } from './svelte-markdown/src/context.js'
  export let depth
  export let raw
//   export let text

//   const { slug, getOptions } = getContext(key)
//   const options = getOptions()

//   $: id = options.headerIds
//     ? options.headerPrefix + slug(text)
//     : undefined
</script>

{#if depth === 1}
  <h1><slot></slot></h1>
{:else if depth === 2}
  <h2><slot></slot></h2>
{:else if depth === 3}
  <h3><slot></slot></h3>
{:else if depth === 4}
  <h4><slot></slot></h4>
{:else if depth === 5}
  <h5><slot></slot></h5>
{:else if depth === 6}
  <h6><slot></slot></h6>
{:else}
  {raw}
{/if}

<style>
    h1, h2, h3, h4, h5, h6 {
        margin-bottom: 8px;
        margin-top: 4px;
    }

</style>