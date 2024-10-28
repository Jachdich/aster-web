<script lang="ts">
    import "../popup.css";
    import { aster_logo_wide } from "../lib/logos";

    let sync_ip: string = "cospox.com";
    let sync_port: string = "2345";
    let uname: string = "";
    let password: string = "";

    let splash_strings = [
        "Aster? Hardly even know 'er!", 
        "Just hope it doesn't get rewritten again.",
        "Brought to you by disperate and shifting developers over far too many years.",
        "\'Aster\' was originally short for Asteroid, but we realised the flower is much prettier.",
        "There are over 600 species of aster!",
        "Elecarno says hi.",
        "The font used in Aster is Atkinson Hyperlegible.",
        "I ran out of splash text ideas.",
        "Click me!",
        "There exists an unused vertical version of the full text Aster logo.",
    ];
    let previousString = ""

    function validate_port() {
        let a = document.getElementById("login-sync-port-input") as HTMLInputElement;
        a.value = a.value.replace(/[^0-9]/g, '');
        if (a.value != "" && Number.parseInt(a.value) > 65535) {
            a.value = "65535";
        }
    }

    export let authenticate: (uname: string, passwd: string, ip: string, port: number, action: "Login" | "Register") => void;

    function login() {
        authenticate(uname, password, sync_ip, parseInt(sync_port), "Login")
    }
    function register() {
        authenticate(uname, password, sync_ip, parseInt(sync_port), "Register")
    }

    function getRandomString() {
        let newString;
        do {
        newString = splash_strings[Math.floor(Math.random() * splash_strings.length)];
        } while (newString === previousString); // Keep picking if it's the same as before
        previousString = newString; // Update the previous string
        return newString;
    }
    let random_splash = getRandomString();
</script>

<div id="login-window">
    <svg id="logo" class="pixel-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 32" fill="currentColor">
        <path stroke="var(--accent-1-light)" d={aster_logo_wide}/>
    </svg>
      
    <div id="login" >
        <div class="input-container">
            <p id="login-sync-ip-label">Sync&nbsp;Server&nbsp;IP&nbsp;</p>
            <input id="login-sync-ip-input" type="text" placeholder="Enter IP" class="login-input" bind:value={sync_ip} required>
        </div>
        <div class="input-container">
            <p id="login-sync-port-label">Sync&nbsp;Server&nbsp;Port</p>
            <input id="login-sync-port-input" type="text" placeholder="Enter port" class="login-input" on:input={validate_port} bind:value={sync_port} required>
        </div>
        <div class="input-container">
            <p id="login-uname-label">Username</p>
            <input id="login-uname-input" type="text" placeholder="Enter Username" class="login-input" bind:value={uname} required>
        </div>
        <div class="input-container">
            <p id="login-pword-label">Password</p>
            <input id="login-pword-input" type="password" placeholder="Enter Password" class="login-input" bind:value={password} required>
        </div>
        <div class="input-container">
            <button class="login-button" style="margin-right: 4px;" on:click={register}>Register</button>
            <button class="login-button" style="margin-left: 4px;" on:click={login}>Login</button>
        </div>
    </div>

    <div id="splash-text">
        <p on:click={() => random_splash = getRandomString()} style="cursor: pointer;">
            {random_splash}
        </p>
    </div>
</div>

<style>
    /* @keyframes color_shifting {
        0%   { color: #be8fd0; }
        25%  { color: #a776bb; }
        50%  { color: #be8fd0; }
        75%  { color: #a776bb; }
        100% { color: #be8fd0; }
    } */

    #splash-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100px;
        font-size: 18px;
        text-align: center;
        /* font-weight: bold; */
        /* animation: color_shifting 5s infinite; */
        transition: 0.5s ease;
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
        width: 30%;
        min-width: 410px;
        max-width: 500px;
        left: 50%;
        right: 50%;
        top: 50%;
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
        font-size: 15px;
    }

    .login-button {
        width: 80%;
        height: 40px;
        font-size: 15px;
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
        font-size: 15px;
    }
</style>
