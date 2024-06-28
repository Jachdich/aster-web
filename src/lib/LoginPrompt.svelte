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
    <label id="login-sync-ip-label" for="login-sync-ip-input">Sync&nbsp;server&nbsp;IP&nbsp;</label>
    <input id="login-sync-ip-input" type="text" placeholder="Enter IP" class="login-input" bind:value={sync_ip} required>
    <label id="login-sync-port-label" for="login-sync-port-input">Sync&nbsp;server&nbsp;port</label>
    <input id="login-sync-port-input" type="text" placeholder="Enter port" class="login-input" on:input={validate_port} bind:value={sync_port} required>
    <label id="login-uname-label" for="login-uname-input">Username</label>
    <input id="login-uname-input" type="text" placeholder="Enter Username" class="login-input" bind:value={uname} required>
    <label id="login-pword-label" for="login-pword-input">Password</label>
    <input id="login-pword-input" type="password" placeholder="Enter Password" class="login-input" bind:value={password} required>
    <button id="login-button" on:click={login}>Login</button>
    <button id="register-button" on:click={register}>New here? Register</button>
</div>


<style>
.login-input {
    width: 300px;
    display: inline-block;
    color: inherit;
    background-color: inherit;
    margin-left: 8px;
    margin-bottom: 10px;
}

#login-button {
    grid-row: 5;
    grid-column: 2;
    margin-left: 8px;
}

#login-sync-ip-label   { grid-row: 1; grid-column: 1; }
#login-sync-ip-input   { grid-row: 1; grid-column: 2; }
#login-sync-port-label { grid-row: 2; grid-column: 1; }
#login-sync-port-input { grid-row: 2; grid-column: 2; }
#login-uname-label     { grid-row: 3; grid-column: 1; }
#login-uname-input     { grid-row: 3; grid-column: 2; }
#login-pword-label     { grid-row: 4; grid-column: 1; }
#login-pword-input     { grid-row: 4; grid-column: 2; }
</style>
