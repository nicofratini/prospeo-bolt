// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@sidebase/nuxt-auth',
    '@nuxt/eslint-config',
    '@vueuse/nuxt',
    'nuxt-icon',
  ],
  css: ['~/assets/css/main.scss'],
  router: {
    middleware: ['onboarding'],
  },
  runtimeConfig: {
    private: {
      AUTH_SECRET: process.env.AUTH_SECRET,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      CALCOM_API_KEY: process.env.CALCOM_API_KEY,
    },
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
  compatibilityDate: '2025-03-03',
  nitro: {
    routeRules: {
      '/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': '*',
        },
      },
    },
  },
  typescript: {
    strict: true,
  },
  auth: {
    isEnabled: true,
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: true,
      allow404WithoutAuth: true,
    },
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    vueI18n: './i18n.config.ts',
    strategy: 'prefix',
  },
  vueuse: {
    ssrHandlers: true,
  },
});
