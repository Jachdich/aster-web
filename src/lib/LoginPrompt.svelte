<script lang="ts">
    import "../popup.css";

    let sync_ip: string = "cospox.com";
    let sync_port: string = "2345";
    let uname: string = "";
    let password: string = "12asd";
    
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
</script>

<div id="login" class="centre-window">
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

<style>
#login {
    color: var(--white-1);
    background-color: var(--panel-2);
    width: 30%;
    min-width: 410px;
    max-width: 500px;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;

    padding: 15px;
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
