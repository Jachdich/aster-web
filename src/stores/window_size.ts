import { writable } from 'svelte/store';

export const is_mobile_width = writable(false);

function updateWidth() {
    is_mobile_width.set(window.innerWidth <= 1024);
}

export function initWindowSizeListener() {
    updateWidth();
    window.addEventListener('resize', updateWidth);
}

export function removeWindowSizeListener() {
    window.removeEventListener('resize', updateWidth);
}
