
<script lang="ts">
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { set_sync_server, Server} from "../network";
    import { onMount } from 'svelte'

    onMount(() => {
        (document.getElementById("login-sync-port-input") as HTMLInputElement).value = "2345"; // dumb hack to set default value of input
    });
  
    let sync_ip: string = "localhost";
    let sync_port: string = "2345";
    let uname: string = "KingJellyfish";
    let password: string = "12asd";

    let error_msg = "";
    let show_login = true;

    function login() {
        let port = Number.parseInt(sync_port);
        if (port > 65535) {
            error_msg = "The port number must not be greater than 65535";
            return;
        }
        let server = new Server(sync_ip, port);
        server.connect(uname, password).then(() => {
            set_sync_server(server);
            goto("/aster");
        }, (err) => {
            error_msg = err;
        });
        show_login = false;
    }

    function register() {
        
    }
    function dismiss_error() {
        error_msg = "";
        show_login = true;
    }

    function validate_port() {
        let a = document.getElementById("login-sync-port-input") as HTMLInputElement;
        a.value = a.value.replace(/[^0-9]/g, '');
    }
    
</script>

<svelte:head>
	<title>Aster</title>
	<meta name="description" content="Aster web client" />
</svelte:head>

{#if show_login}
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
{:else}
    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
{/if}

{#if error_msg != ""}
    <div id="error" class="centre-window">
        <div style="margin-bottom: 5px;">{error_msg}</div>
        <button on:click={dismiss_error} id="error-dismiss">Ok</button>
    </div>
{/if}

<style>
input, button {
    border: 1px solid #444444;
    border-radius: 6px;
    color: inherit;
    background-color: inherit;
}

:global(body) {
    background-color: #1C1C1C;
    color: #d3d3d3;
    font-family: sans-serif;
}

input:focus {
    outline: none;
}

.login-input {
    width: 300px;
    display: inline-block;
    color: inherit;
    background-color: inherit;
    margin-left: 8px;
    margin-bottom: 10px;
}

.centre-window {
    display: grid;
    padding: 10px;
    border: 2px solid #444444;
    background-color: #1C1C1C;
    border-radius: 6px;
    position: absolute;
    width: max-content;
    left: 50%;
    right: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
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

#error {
    z-index: 1;
}

#error-dismiss {
    width: 64px;
    margin: 0 auto;
    display: block;
}

.lds-spinner {
    color: official;
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
    position: absolute;
    left: 50%;
    right: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
.lds-spinner div {
  transform-origin: 40px 40px;
  animation: lds-spinner 1.2s linear infinite;
}
.lds-spinner div:after {
  content: " ";
  display: block;
  position: absolute;
  top: 3px;
  left: 37px;
  width: 6px;
  height: 18px;
  border-radius: 20%;
  background: #fff;
}
.lds-spinner div:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: -1.1s;
}
.lds-spinner div:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: -1s;
}
.lds-spinner div:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: -0.9s;
}
.lds-spinner div:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: -0.8s;
}
.lds-spinner div:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: -0.7s;
}
.lds-spinner div:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: -0.6s;
}
.lds-spinner div:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: -0.5s;
}
.lds-spinner div:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: -0.4s;
}
.lds-spinner div:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: -0.3s;
}
.lds-spinner div:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: -0.2s;
}
.lds-spinner div:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: -0.1s;
}
.lds-spinner div:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 0s;
}
@keyframes lds-spinner {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

</style>
