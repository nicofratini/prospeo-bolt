<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('dashboard.title') }}
    </h1>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Welcome Card -->
        <div class="bg-primary-50 dark:bg-primary-900/50 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
            {{ t('dashboard.welcome', { name: user?.name || t('dashboard.user') }) }}
          </h2>
          <p class="text-primary-600 dark:text-primary-300">
            {{ t('dashboard.lastLogin') }}: {{ formatDate(user?.lastLogin) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// This page is protected by default due to global auth middleware
definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const { data: { user } } = useAuth();

function formatDate(date: string | undefined) {
  if (!date) return t('common.never');
  return new Date(date).toLocaleDateString();
}
</script>