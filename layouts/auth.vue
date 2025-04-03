<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <div class="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <!-- Logo/Branding Section -->
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <NuxtLink
          :to="localePath('/')"
          class="flex justify-center"
        >
          <Icon
            name="heroicons:cube-transparent"
            class="w-12 h-12 text-primary-600 dark:text-primary-400"
          />
        </NuxtLink>
      </div>

      <!-- Main Content Container -->
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div 
          class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-200"
        >
          <slot />
        </div>
      </div>

      <!-- Language Switcher -->
      <div class="mt-8 text-center">
        <select
          v-model="locale"
          class="appearance-none bg-transparent text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1 text-sm"
          @change="switchLocale"
        >
          <option value="en">{{ $t('common.english') }}</option>
          <option value="fr">{{ $t('common.french') }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const localePath = useLocalePath();
const { locale } = useI18n();

const switchLocale = () => {
  // Locale is automatically updated by v-model
};
</script>