<script lang="ts">
    import "../routes/popup.css";
    import "../routes/styles.css";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    function cancel(_: Event) {
        dispatch("dismiss");
    }

    function ok(_: Event) {
        dispatch("add_server", {"ip": ip, "port": parseInt(port)})
        dispatch("dismiss");
    }
    function validate_port() {
        port_input.value = port_input.value.replace(/[^0-9]/g, '');
    }
    let ip: string;
    let port: string;
    let port_input: HTMLInputElement;
</script>

<div class="popup centre-window">
    <label for="n_ip" id="n_t_ip">IP</label>
    <input id="n_ip" bind:value={ip}>

    <label for="n_port" id="n_t_port">Port</label>
    <input id="n_port" on:input={validate_port} bind:this={port_input} bind:value={port}>

    <input type="radio" id="register_radio" name="how_to_connect_lol" checked={true}>
    <label for="register_radio">Register</label>

    <input type="radio" id="login_radio" name="how_to_connect_lol">
    <label for="login_radio">Login (I've connected before)</label>
    <div id="n_buttons">
        <button id="n_cancel" on:click={cancel}>Cancel</button>
        <button id="n_ok" on:click={ok}>Ok</button>
    </div>
</div>

<style>
#n_t_ip    { grid-row: 1; grid-column: 1; }
#n_ip      { grid-row: 1; grid-column: 2; }
#n_t_port  { grid-row: 2; grid-column: 1; }
#n_port    { grid-row: 2; grid-column: 2; }
#n_buttons { grid-row: 3; grid-column-start: 1; grid-column-end: 3; width: 100%; }

#n_ok {
    float: left;
    width: 47%;
    margin: 0;
}
#n_cancel {
    float: right;
    width: 47%;
    margin: 0;
}
</style>
