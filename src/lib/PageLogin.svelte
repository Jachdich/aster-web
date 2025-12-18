<script lang="ts">
    // # CSS & LOCALE ----------------------------------------------------------
    import "../popup.css";
    import { aster_logo_wide } from "./logos";
    import { t } from 'svelte-i18n'

    // # LOGIN -----------------------------------------------------------------
    let sync_ip: string = "localhost";
    let sync_port: string = "2345";
    let uname: string = "KingJellyfish";
    let password: string = "asdf";

    function validate_port() {
        let a = document.getElementById(
            "inp-login-sync-port"
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
        "\"jipe\" - KingJellyfish, often"
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

    // # QoL
    import { onMount } from "svelte";
    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

    function handleKeydown(event) {
        if (event.key === "Enter") {
            login()
        }
    }
</script>

<div class="con-login">
    <svg id="gra-login-logo" 
        class="pixel-img" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 32">
        <path stroke="var(--accent-1-light)" d={aster_logo_wide}/>
    </svg>
      
    <div class="pan-login" >
        <!-- Sync Server Fields -------------------------------------------- -->
        <div class="con-login-input">
            <p>{$t('PageLogin.sync_server_ip')}</p>
            <input  type="text" 
                    placeholder="{$t('PageLogin.sync_server_ip_input.placeholder')}" 
                    class="inp-login" required
                    bind:value={sync_ip}>
        </div>
        <div class="con-login-input">
            <p >{$t('PageLogin.sync_server_port')}</p>
            <input  id="inp-login-sync-port" type="text" 
                    placeholder="{$t('PageLogin.sync_server_port_input.placeholder')}" 
                    class="inp-login" required 
                    on:input={validate_port} bind:value={sync_port}>
        </div>


        <!-- Account Fields ------------------------------------------------ -->
        <div class="con-login-input">
            <p >{$t('PageLogin.username')}</p>
            <input  type="text" 
                    placeholder="{$t('PageLogin.username_input.placeholder')}" 
                    class="inp-login" required
                    bind:value={uname}>
        </div>
        <div class="con-login-input">
            <p >{$t('PageLogin.password')}</p>
            <input  type="password" 
                    placeholder="{$t('PageLogin.password_input.placeholder')}" 
                    class="inp-login" required 
                    bind:value={password}>
        </div>


        <!-- Login/Register ------------------------------------------------ -->
        <div class="con-login-input">
            <button class="btn-login" 
                    style="margin-right: 4px;" 
                    on:click={register}>
                {$t('PageLogin.register')}
            </button>
            <button class="btn-login" 
                    style="margin-left: 4px;" 
                    on:click={login}>
                {$t('PageLogin.login')}
            </button>
        </div>
    </div>


    <div class="lab-splash-text">
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

    .con-login {
        width: 40%;
        min-width: 350px;
        max-width: 500px;

        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;

        display: flex;
        flex-direction: column;

        padding: 10px;

        border-radius: var(--radius-3);
    }
    .pan-login {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        padding: 15px;

        color: var(--white-1);
        background-color: var(--panel-2);

        border-bottom: 3px solid var(--panel-3);
        border-radius: var(--radius-2);
    }

    #gra-login-logo {
        width: 360px;
        margin: 0 auto;
        padding-bottom: 32px;
    }

    .con-login-input {
        display: flex;
        justify-content: center;
        align-items: stretch;
        flex-direction: row;

        margin-top: 8px;
        margin-bottom: 8px;
    }
    .con-login-input p {
        width: 30%;
        margin: 0;
        font-size: var(--font-size-body);
    }

    .inp-login {
        height: 45px;
        width: 70%;

        color: var(--white-1);
        margin-left: 8px;

        font-size: var(--font-size-body);
        text-align: center;
    }

    .btn-login {
        height: 40px;
        width: 80%;

        color: var(--text-dark);
        background-color: var(--accent-1-light);

        font-size: var(--font-size-body);
    }
    .btn-login:hover {
        background-color: var(--accent-1-dark);
    }

    .lab-splash-text {
        height: 100px;
        
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;

        font-size: 18px;
        text-align: center;
        
        transition: 0.5s ease;

        /* font-weight: bold;
        animation: rainbow_colours 5s infinite; */
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }
    .lab-splash-text:hover {
        font-size: 18.5px;
    }
</style>
