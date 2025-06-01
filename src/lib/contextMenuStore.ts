import { writable } from 'svelte/store';

export const contextMenuStore = writable({
    show: false,
    x: 0,
    y: 0,
    menuItems: [],
    menuSize: { h: 0, w: 0 },
    browser: { w: 0, h: 0 }
});

export function showContextMenu(event, items) {
    event.preventDefault();

    const x = event.clientX;
    const y = event.clientY;
    const browser = {
        w: window.innerWidth,
        h: window.innerHeight
    };

    contextMenuStore.update(state => ({
        ...state,
        show: true,
        x,
        y,
        menuItems: items,
        browser
    }));
}
