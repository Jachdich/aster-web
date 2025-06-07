<script>
    import { contextMenuStore } from './contextMenuStore';

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
    <link rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" 
        integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer"/>
</svelte:head>

{#if state.show}
<nav bind:this={menuRef} 
    style="position:absolute; top:{state.y}px; left:{state.x}px; z-index:1000">
    <div class="pan-conmenu">
        <ul>
            {#each state.menuItems as item}
                {#if item.name === "hr"}
                    <hr>
                {:else}
                    <li>
                        <button on:click={() => {hideMenu();item.onClick?.();}}>
                            <i class={item.class}></i>
                            {item.displayText}
                            <span class="lab-conmenu-shortcut">{item.shortcut}</span>
                        </button>
                    </li>
                {/if}
            {/each}
        </ul>
    </div>
</nav>
{/if}

<svelte:window on:click={hideMenu} />

<style>
    * {
        margin: 0;
        padding: 0;
    }
    .pan-conmenu {
        width: 250px;
        
        display: inline-flex;
        flex-direction: column;
        
        padding-top: 5px;
        padding-bottom: 5px;
        padding-right: 5px;
        
        background-color: var(--panel-2);
        
        border: 1px var(--panel-3) solid;
        border-radius: var(--radius-2);
        
        overflow: hidden;
        filter: drop-shadow(0px 5px 7px var(--panel-1));
    }
    .pan-conmenu ul{
        margin: 6px;
    }
    ul li{
        width: 1fr;
        display: block;
        list-style-type: none;
    }
    ul li button{
        height: 28px;
        width: 100%;
        
        color: var(--white-1);
        background-color: var(--panel-2);
        
        border: 0px;
        
        text-align: left;
    }
    ul li button:hover{
        color: var(--text-gray);
        background-color: var(--panel-3);
        
        border-radius: var(--radius-3);
        
        text-align: left;
    }
    ul li button i{
        padding: 0px 15px 0px 10px;
    }
    hr{
        width: 100%;
        margin: 5px 0px;
    }
    .lab-conmenu-shortcut {
        float: right;
        color: var(--text-gray);
    }
</style>