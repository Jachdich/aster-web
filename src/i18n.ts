import { register, init, getLocaleFromNavigator, waitLocale } from 'svelte-i18n';

register('en', () => import('./locale/en.json'));
register('nl', () => import('./locale/nl.json'));

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});

export const i18nReady = waitLocale();