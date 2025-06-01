<script>
    import { contextMenuStore } from './contextMenuStore'; // adjust path as needed

    let menuRef;
    let state = {
        show: false,
        x: 0,
        y: 0,
        menuItems: [],
        menuSize: { h: 0, w: 0 },
        browser: { w: 0, h: 0 }
    };

    contextMenuStore.subscribe(value => {
        state = value;

        if (value.show) {
            requestAnimationFrame(() => {
                if (menuRef) {
                    const h = menuRef.offsetHeight;
                    const w = menuRef.offsetWidth;
                    let { x, y, browser } = value;

                    if (browser.h - y < h) y -= h;
                    if (browser.w - x < w) x -= w;

                    contextMenuStore.update(s => ({
                        ...s,
                        x,
                        y,
                        menuSize: { h, w }
                    }));
                }
            });
        }
    });

    function hideMenu() {
        contextMenuStore.update(s => ({ ...s, show: false }));
    }
</script>

<svelte:head>
    <!-- You can change icon sets according to your taste. Change `class` value in `menuItems` above to represent your icons. -->
    <!-- <link rel="stylesheet" href="/icon/css/mfglabs_iconset.css"> -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<style>
    * {
        padding: 0;
        margin: 0;
    }
    .navbar{
        display: inline-flex;
        border: 1px var(--panel-3) solid;
        width: 170px;
        background-color: var(--panel-2);
        border-radius: var(--radius-2);
        overflow: hidden;
        flex-direction: column;
        padding-top: 5px;
        padding-bottom: 5px;
        filter: drop-shadow(0px 5px 7px var(--panel-1));
    }
    .navbar ul{
        margin: 6px;
    }
    ul li{
        display: block;
        list-style-type: none;
        width: 1fr;
    }
    ul li button{
        /* font-size: 1rem; */
        color: var(--text-gray);
        width: 100%;
        height: 28px;
        text-align: left;
        border: 0px;
        background-color: var(--panel-2);
    }
    ul li button:hover{
        color: var(--text-gray);
        text-align: left;
        border-radius: var(--radius-3);
        background-color: var(--panel-3);
    }
    ul li button i{
        padding: 0px 15px 0px 10px;
    }
    ul li button i.fa-square{
        color: #var(--text-gray);
    }
    ul li button:hover > i.fa-square{
        color: var(--text-gray);
    }
    ul li button:hover > i.warning{
        color: crimson;
    }
    :global(ul li button.info:hover){
        color: navy;
    }
    hr{
        border: none;
        border-bottom: 1px solid var(--text-gray);
        margin: 5px 0px;
    }
</style>

<!-- <div class="content" bind:this={content}>Right click somewhere!</div> -->

{#if state.show}
<nav bind:this={menuRef} style="position: absolute; top:{state.y}px; left:{state.x}px; z-index: 1000">
    <div class="navbar">
        <ul>
            {#each state.menuItems as item}
                {#if item.name === "hr"}
                    <hr>
                {:else}
                    <li>
                        <button on:click={() => { hideMenu(); item.onClick?.(); }}>
                            <i class={item.class}></i> {item.displayText}
                        </button>
                    </li>
                {/if}
            {/each}
        </ul>
    </div>
</nav>
{/if}

<svelte:window on:click={hideMenu} />