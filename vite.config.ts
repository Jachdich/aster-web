import path from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/aster/',
  resolve: {
    alias: {
      $styles: path.resolve('./src') // now you can do $styles/vars.scss
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "$styles/vars.scss" as *;`
      }
    }
  }
});
