<script lang="ts">
    // # CSS & LOCALE ----------------------------------------------------------
    import "../popup.css";
    import { aster_logo_wide } from "./logos";
    import { t } from 'svelte-i18n'

    // # LOGIN -----------------------------------------------------------------
    let sync_ip: string = "cospox.com";
    let sync_port: string = "2345";
    let uname: string = "";
    let password: string = "";

    function validate_port() {
        let a = document.getElementById(
            "login-sync-port-input"
        ) as HTMLInputElement;
        a.value = a.value.replace(/[^0-9]/g, '');
        if (a.value != "" && Number.parseInt(a.value) > 65535) {
            a.value = "65535";
        }
    }

    export let authenticate: (
        uname: string, 
        passwd: string, 
        ip: string, 
        port: number, 
        action: "Login" | "Register"
    ) => void;

    function login() {
        authenticate(uname, password, sync_ip, parseInt(sync_port), "Login")
    }
    function register() {
        authenticate(uname, password, sync_ip, parseInt(sync_port), "Register")
    }

    // # SPLASH TEXT -----------------------------------------------------------
    let splash_strings = [
        "Aster? Hardly even know 'er!", 
        "Just hope it doesn't get rewritten again.",
        "Brought to you by disperate and shifting developers over far too many years.",
        "\'Aster\' was originally short for Asteroid, but we realised the flower is much prettier.",
        "There are over 600 species of aster!",
        "Elecarno says hi.",
        "KingJellyfish says hi.",
        "The font used in Aster is Atkinson Hyperlegible.",
        "I ran out of splash text ideas.",
        "Click me!",
        "There exists an unused vertical version of the full text Aster logo.",
        "Aster is a thought experiment.",
        "Aster cannot operate within the fourth dimension.",
        "Aster time is UTC-24.",
        "The Latex-Typst wars will rage for all eternity.",
        "Markdown is love Markdown is life.",
        "We have no idea what to do for the mobile app.",
        "KingJellyfish will write a new markdown parser for Aster in approximately 7 years.",
    ];

    if (new Date().getDate() !== 1) {
        splash_strings.push("It's the firts of the month!");
    }
    
    let previous_string = ""
    
    function get_random_string() {
        let new_string;
        do {
            new_string = splash_strings[
                Math.floor(Math.random() * splash_strings.length)
            ];
        } while (new_string === previous_string);
        previous_string = new_string;
        return new_string;
    }
    let random_splash = get_random_string();
</script>

<div id="login-window">
    <svg id="logo" 
        class="pixel-img" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 32">
        <path stroke="var(--accent-1-light)" d={aster_logo_wide}/>
    </svg>
      
    <div id="login" >
        <!-- Sync Server Fields -------------------------------------------- -->
        <div class="input-container">
            <p class="login-input-label">{$t('PageLogin.sync_server_ip')}</p>
            <input  id="login-sync-ip-input" type="text" 
                    placeholder="{$t('PageLogin.sync_server_ip_input.placeholder')}" 
                    class="login-input" required
                    bind:value={sync_ip}>
        </div>
        <div class="input-container">
            <p >{$t('PageLogin.sync_server_port')}</p>
            <input  id="login-sync-port-input" type="text" 
                    placeholder="{$t('PageLogin.sync_server_port_input.placeholder')}" 
                    class="login-input" required 
                    on:input={validate_port} bind:value={sync_port}>
        </div>


        <!-- Account Fields ------------------------------------------------ -->
        <div class="input-container">
            <p >{$t('PageLogin.username')}</p>
            <input  id="login-uname-input" type="text" 
                    placeholder="{$t('PageLogin.username_input.placeholder')}" 
                    class="login-input" required
                    bind:value={uname}>
        </div>
        <div class="input-container">
            <p >{$t('PageLogin.password')}</p>
            <input  id="login-pword-input" type="password" 
                    placeholder="{$t('PageLogin.password_input.placeholder')}" 
                    class="login-input" required 
                    bind:value={password}>
        </div>


        <!-- Login/Register ------------------------------------------------ -->
        <div class="input-container">
            <button class="login-button" 
                    style="margin-right: 4px;" 
                    on:click={register}>
                {$t('PageLogin.register')}
            </button>
            <button class="login-button" 
                    style="margin-left: 4px;" 
                    on:click={login}>
                {$t('PageLogin.login')}
            </button>
        </div>
    </div>


    <div id="splash-text">
        <!-- A11y hates me because I made a <p> clickable -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p on:click={() => random_splash = get_random_string()} 
            style="cursor: pointer;">
            {random_splash}
        </p>
    </div>
</div>

<style>
    /* @keyframes rainbow_colours {
        0%    { color: red;       }
        20%   { color: orange;    }
        40%   { color: yellow;    }
        60%   { color: lime;      }
        80%   { color: lightblue; }
        100%  { color: red;       }  
    } */

    #splash-text {
        display: flex; flex-direction: column; 
        align-items: center; justify-content: center;
        height: 100px;
        font-size: 18px;
        text-align: center;
        transition: 0.5s ease;
        /* font-weight: bold;
        animation: rainbow_colours 5s infinite; */
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }

    #splash-text:hover {
        font-size: 18.5px;
    }

    #logo {
        width: 360px;
        padding-bottom: 32px;
        margin: 0 auto;
    }

    #login-window {
        padding: 10px;
        border-radius: var(--radius-3);
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        position: absolute;
        left: 50%;
        right: 50%;
        top: 50%;
        width: 30%;
        min-width: 350px;
        max-width: 500px;
        display: flex;
        flex-direction: column;
    }

    #login {
        color: var(--white-1);
        background-color: var(--panel-2);
        border-bottom: 3px solid var(--panel-3);
        background-color: var(--panel-2);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        padding: 15px;
        border-radius: var(--radius-2);
    }

    .login-input {
        width: 70%;
        color: var(--white-1);
        margin-left: 8px;
        text-align: center;
        font-size: var(--font-size-body);
        height: 45px;
    }

    .login-button {
        width: 80%;
        height: 40px;
        font-size: var(--font-size-body);
        color: var(--text-dark);
        background-color: var(--accent-1-light);
    }

    .login-button:hover {
        background-color: var(--accent-1-dark);
    }

    .input-container {
        display: flex;
        justify-content: center;
        align-items: stretch;
        flex-direction: row;
        margin-bottom: 8px;
        margin-top: 8px;
    }

    .input-container p {
        width: 30%;
        font-size: var(--font-size-body);
    }
</style>
