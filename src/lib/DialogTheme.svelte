<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";
    import Dialog from "./Dialog.svelte";


    // # THEME EDITOR ----------------------------------------------------------
    import ColorPicker from 'svelte-awesome-color-picker';

    let hex = "#000000"
    let rgb = { "r": 0, "g": 0, "b": 0, "a": 1 }
    let hsv = { "h": 0, "s": 0, "v": 0, "a": 1}

    let bg: any
    let panel1: any
    let panel2: any
    let panel3: any
    let accent1_light: any
    let accent1_dark: any
    let white1: any
    let text_dark: any
    let text_gray: any
    

    // # LOCALE SWITCHING ------------------------------------------------------
    import { locale } from 'svelte-i18n';

    function handleLanguageChange(event: 
            { target: { value: string | null | undefined; }; 
        }) {
        locale.set(event.target.value);
    }


    // # DIALOG ----------------------------------------------------------------
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function close(_: Event) {
        dispatch("dismiss");
    }
</script>

<Dialog id="theme"
        title="Theme Editor"
        pref_width={510}
        has_logo={true}
        on:dismiss={close}>
        <!-- Theme Settings ------------------------------------------------ -->
        <!-- <div class="input-container">
            <p>{$t('DialogTheme.colour.background')}</p>
            <div class="picker-dark">
                <ColorPicker bind:bg label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.panel1')}</p>
            <div class="picker-dark">
                <ColorPicker bind:panel1 label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.panel2')}</p>
            <div class="picker-dark">
                <ColorPicker bind:panel2 label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.panel3')}</p>
            <div class="picker-dark">
                <ColorPicker bind:panel3 label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.accent_light')}</p>
            <div class="picker-dark">
                <ColorPicker bind:accent1_light label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.accent_dark')}</p>
            <div class="picker-dark">
                <ColorPicker bind:accent1_dark label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.text_white')}</p>
            <div class="picker-dark">
                <ColorPicker bind:white1 label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.text_gray')}</p>
            <div class="picker-dark">
                <ColorPicker bind:text_gray label=""/>
            </div>
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.colour.text_dark')}</p>
            <div class="picker-dark">
                <ColorPicker bind:text_dark label=""/>
            </div>
        </div> -->

        <!-- Language Selector --------------------------------------------- -->
        <div class="input-container">
            <p>{$t('DialogTheme.language')}</p>
            <div class="picker-dark">
                <select id="lang-select" 
                        bind:value={$locale} 
                        on:change={handleLanguageChange}>
                    <option value="da">da: Dansk</option>
                    <option value="de">de: Deutsch</option>
                    <option value="en">en: English</option>
                    <option value="es">es: Español</option>
                    <option value="nl">nl: Nederlands</option>
                  </select>                  
            </div>
        </div>
</Dialog>

<style>
    .picker-dark {
		--cp-bg-color: var(--panel-2);
		--cp-border-color: var(--panel-3);
		--cp-text-color: var(--white-1);
		--cp-input-color: var(--panel-1);
		--cp-button-hover-color: var(--panel-3);
        margin-left: auto
    }

    #lang-select {
        background-color: var(--panel-1);
        border-radius: var(--radius-3);
        color: var(--white-1);
        border: none;
        padding: 4px;
    }
</style>
