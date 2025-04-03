import { defineNuxtPlugin } from '#app';
import { setupCalendar, Calendar } from 'v-calendar';
import 'v-calendar/style.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(setupCalendar, {
    // Default configuration options
    masks: {
      input: 'YYYY-MM-DD',
    },
    locales: {
      'fr-FR': {
        firstDayOfWeek: 2, // Monday
        masks: {
          L: 'DD/MM/YYYY',
          // Add more format masks as needed
        },
      },
    },
    // Set default locale based on user preference
    locale: 'fr-FR',
  });

  // Register the Calendar component globally
  nuxtApp.vueApp.component('VCalendar', Calendar);
});