<script lang="ts">
    import "../popup.css";
    import { createEventDispatcher } from "svelte";
    import ColorPicker from 'svelte-awesome-color-picker';
    import { aster_logo_wide } from "./logos";
    const dispatch = createEventDispatcher();
    import { t } from "svelte-i18n";

    let hex = "#000000"
    let rgb = { "r": 0, "g": 0, "b": 0, "a": 1 }
    let hsv = { "h": 0, "s": 0, "v": 0, "a": 1}

    // theme colors
    let bg
    let panel1
    let panel2
    let panel3
    let accent1_light
    let accent1_dark
    let white1
    let text_dark
    let text_gray

    function cancel(_: Event) {
        dispatch("dismiss");
    }
    
    import { locale } from 'svelte-i18n';

    function handleLanguageChange(event) {
        locale.set(event.target.value);
    }

</script>

<div id="bg-darken">
    <svg id="logo" class="pixel-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
        <path stroke="var(--accent-1-light)" d={aster_logo_wide}/>
    </svg>
    <div id="add-server-dialog" class="popup centre-window">
        <div class="input-container">
            <p style="font-size: 16px; margin-bottom: 10px; margin-left: auto; margin-right: auto; text-align: center">Theme Editor</p>
        </div>
        <div class="input-container">
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
        </div>
        <div class="input-container">
            <p>{$t('DialogTheme.language')}</p>
            <div class="picker-dark">
                <select id="lang-select" on:change={handleLanguageChange}>
                    <option value="en">English</option>
                    <option value="nl">Nederlands</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>                  
            </div>
        </div>
        <div class="input-container" style="margin-top: auto">
            <button id="cancel" on:click={cancel}>Close</button>
        </div>
    </div>
</div>

<style>
    .picker-dark {
		--cp-bg-color: var(--panel-2);
		--cp-border-color: var(--panel-3);
		--cp-text-color: var(--white-1);
		--cp-input-color: var(--panel-1);
		--cp-button-hover-color: var(--panel-3);
        margin-left: auto
    }

    #logo {
        position: fixed;
        width: 360px;
        left: calc(50% - 165px);
        top: calc(50% - 360px);
    }

    #bg-darken {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2 !important;
        display: grid;
        background-color: rgba(0, 0, 0, 0.5);
    }

    #add-server-dialog {
        color: var(--white-1);
        background-color: var(--panel-2);
        width: 30%;
        min-width: 410px;
        max-width: 500px;
        height: 400px;

        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        padding: 15px;
    }

    .input-container {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        font-size: 15px;
        width: 100%;
    }

    .input-container p {
        width: 30%;
        margin: 0;
    }

    .input-container input {
        height: 30px;
        padding-left: 10px;
    }

    .input-container button {
        width: 100%;
        height: 30px;
    }

    #lang-select {
        background-color: var(--panel-1);
        border-radius: var(--radius-3);
        color: var(--white-1);
        border: none;
        padding: 4px;
    }

</style>
