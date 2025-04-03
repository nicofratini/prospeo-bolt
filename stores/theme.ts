import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false,
  }),

  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');

      // Apply theme to document
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      }
      else {
        document.documentElement.classList.remove('dark');
      }
    },

    initTheme() {
      // Check for saved theme preference or use system preference
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      this.isDarkMode = savedTheme
        ? savedTheme === 'dark'
        : systemPrefersDark;

      // Apply initial theme
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    },
  },
});
