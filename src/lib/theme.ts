const STORAGE_KEY = 'theme';
const DARK_CLASS = 'dark-theme';

/** Whether the dark theme is currently on the page. */
export const isDarkTheme = () => document.body.classList.contains(DARK_CLASS);

/** Puts the saved theme on the page. Called once before the app renders, so every route — not just Home — starts in it. */
export function applyStoredTheme(): boolean {
  const dark = localStorage.getItem(STORAGE_KEY) === 'dark';
  document.body.classList.toggle(DARK_CLASS, dark);
  return dark;
}

/** Switches theme and remembers the choice. */
export function setTheme(dark: boolean): void {
  document.body.classList.toggle(DARK_CLASS, dark);
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
}
