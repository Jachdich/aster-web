// i18n is the library used for localisation.
// this file handles the initilisation of i18n.

import { register, init, getLocaleFromNavigator, waitLocale, locale } from 'svelte-i18n';

const STORAGE_KEY = 'app-locale';

// connects all of the localisation files
register('en', () => import('./locale/en.json'));
register('nl', () => import('./locale/nl.json'));
register('da', () => import('./locale/da.json'));
register('de', () => import('./locale/de.json'));

// attempt to get saved locale setting
function getStartingLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored || getLocaleFromNavigator().split('-')[0];
}

init({
  fallbackLocale: 'en',
  initialLocale: getStartingLocale(),
});


locale.subscribe((value) => {
  if (value) localStorage.setItem(STORAGE_KEY, value);
});

// used in App.svelte, is a bool that sets to true once i18n has loaded.
// app will crash if attempting to load components with localisations before i18n itself has loaded.
export const i18nReady = waitLocale();