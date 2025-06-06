<script lang="ts">
    import "../popup.css";
    import { t } from "svelte-i18n";
    import Dialog from "./Dialog.svelte";

    
    // # CSS THEMES ------------------------------------------------------------
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

	let current_theme = "none";

    function apply_theme(css: string) {
        const existing = document.getElementById("custom-theme");
        if (existing) existing.remove();

        const style = document.createElement("style");
        style.id = "custom-theme";
        style.textContent = css;
        document.head.appendChild(style);
    }

    function theme_upload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const css = e.target?.result as string;
            apply_theme(css);

            localStorage.setItem("custom_theme_css", css);
            localStorage.setItem("custom_theme_name", file.name);
            current_theme = file.name;
        };
        reader.readAsText(file);
    }

    function reset_theme() {
        const existing = document.getElementById("custom-theme");
        if (existing) existing.remove();

        localStorage.removeItem("custom_theme_css");
        localStorage.removeItem("custom_theme_name");
        current_theme = "none";
    }

    onMount(() => {
        const savedCSS = localStorage.getItem("custom_theme_css");
        const savedName = localStorage.getItem("custom_theme_name");

        if (savedCSS && savedName) {
            apply_theme(savedCSS);
            current_theme = savedName;
        }
    });

    // # LOCALE SWITCHING ------------------------------------------------------
    import { locale } from 'svelte-i18n';

    function handleLanguageChange(event: 
            { target: { value: string | null | undefined; }; 
        }) {
        locale.set(event.target.value);
    }


    // # DIALOG ----------------------------------------------------------------
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
        <!-- To redo -->

        <!-- Custom CSS Theme -->
        <!-- Extra margin due to large button -->
        <div class="con-dialog-row" style="margin-bottom: 8px;">
            <span>Custom CSS Theme</span>
            <label style="margin-left: auto;">
                <input type="file" accept=".css" 
                       style="display: none"
                       on:change={theme_upload} />
                <span class="btn-theme-file">{$t('dialog.change')}</span>
            </label>
        </div>

        <div class="con-dialog-row">
            <span>Reset theme</span>
            <span/><span/>
            <button on:click={reset_theme}>
		        Reset
	        </button>
        </div>

        <!-- Language Selector --------------------------------------------- -->
        <div class="con-dialog-row">
            <span>{$t('DialogTheme.language')}</span>
            <select class="inp-select-lang"
                    bind:value={$locale} 
                    on:change={handleLanguageChange}>
                <option value="da">da: Dansk</option>
                <option value="de">de: Deutsch</option>
                <option value="en">en: English</option>
                <option value="es">es: Español</option>
                <option value="nl">nl: Nederlands</option>
            </select>                  
        </div>
</Dialog>

<style>
    .inp-select-lang {
        height: 35px;
        width: 60%;
        
        padding: 4px;
        
        color: var(--white-1);
        background-color: var(--panel-1);
        
        border: none;
        border-radius: var(--radius-3);
        
        font-size: var(--font-size-body);
        text-align: right;
    }
    .inp-select-lang option {
        font-size: var(--font-size-body);
    }

    .btn-theme-file {
        padding: 6px;
        padding-left: 16px;
        padding-right: 16px;
        
        color: var(--white-1);
        background-color: var(--panel-1);
        
        border-radius: var(--radius-3);
        
        cursor: pointer;
    }
    .btn-theme-file:hover {
        background-color: var(--panel-0);
    }
</style>
