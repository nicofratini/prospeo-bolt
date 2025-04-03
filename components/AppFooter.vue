<template>
  <footer class="bg-white dark:bg-gray-800 shadow-inner py-6">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {{ new Date().getFullYear() }} {{ $t('common.appName') }} {{ $t('common.allRightsReserved') }}
          </p>
        </div>
        <div class="flex space-x-4">
          <a
            href="#"
            class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
          >
            {{ $t('common.termsOfService') }}
          </a>
          <a
            href="#"
            class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
          >
            {{ $t('common.privacyPolicy') }}
          </a>
          <a
            href="#"
            class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
          >
            {{ $t('common.contact') }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
