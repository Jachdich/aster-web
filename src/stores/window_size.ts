import { writable } from 'svelte/store';

export const is_mobile_width = writable(false);
export const is_mini_width = writable(false);

function updateWidth() {
    is_mobile_width.set(window.innerWidth <= 830);
    is_mini_width.set(window.innerWidth <= 1400);
}

export function initWindowSizeListener() {
    updateWidth();
    window.addEventListener('resize', updateWidth);
}

export function removeWindowSizeListener() {
    window.removeEventListener('resize', updateWidth);
}
