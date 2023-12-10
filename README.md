# Aster web client

Client for [aster server](https://github.com/Jachdich/aster-server). Currently in development, this repo contains a bunch of experiments using different frameworks. Svelte has seemed most promising so far, and I'm currently working on making the svelte client function properly. See the `svelte-test` folder for more.

## Todo

- [ ] Stop having framework anxiety and actually commit to svelte
- [ ] Support encryption
  - [ ] Figure out how to do encryption better (signed TLS certificates present quite a barrier to hosting a server, but are required on the web)
- [ ] Achieve feature parity with the old (insecure architecture) web client (servers, channels, send/receive messages, etc)