<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('onboarding.features.title') }}
      </h3>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
        {{ t('onboarding.features.description') }}
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid gap-6 sm:grid-cols-2">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="relative group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <!-- Feature Icon -->
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
            <Icon
              :name="feature.icon"
              class="h-6 w-6 text-primary-600 dark:text-primary-400"
            />
          </div>
          <Icon
            name="heroicons:arrow-right"
            class="h-5 w-5 text-gray-400 dark:text-gray-500 transform translate-x-0 group-hover:translate-x-1 transition-transform"
          />
        </div>

        <!-- Feature Content -->
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ feature.title }}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {{ feature.description }}
        </p>

        <!-- Action Button -->
        <UiButton
          :to="localePath(feature.action.path)"
          variant="outline"
          size="sm"
          class="w-full"
        >
          {{ feature.action.label }}
        </UiButton>

        <!-- Hover Border Effect -->
        <div class="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500 dark:bg-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </div>
    </div>

    <!-- Completion Message -->
    <div class="text-center mt-8">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('onboarding.features.completionMessage') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

definePageMeta({
  layout: 'onboarding',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const localePath = useLocalePath();
const { setCanProceed } = inject('onboardingNavigation') as {
  setCanProceed: (value: boolean) => void;
};

// Enable proceeding immediately on features page
onMounted(() => {
  setCanProceed(true);
});

// Define features with their icons, descriptions, and actions
const features = [
  {
    icon: 'heroicons:calendar',
    title: t('onboarding.features.calendar.title'),
    description: t('onboarding.features.calendar.description'),
    action: {
      path: '/dashboard/calendar',
      label: t('onboarding.features.calendar.action'),
    },
  },
  {
    icon: 'heroicons:phone',
    title: t('onboarding.features.calls.title'),
    description: t('onboarding.features.calls.description'),
    action: {
      path: '/dashboard/call-history',
      label: t('onboarding.features.calls.action'),
    },
  },
  {
    icon: 'heroicons:chart-bar',
    title: t('onboarding.features.analytics.title'),
    description: t('onboarding.features.analytics.description'),
    action: {
      path: '/dashboard/analytics',
      label: t('onboarding.features.analytics.action'),
    },
  },
  {
    icon: 'heroicons:home',
    title: t('onboarding.features.properties.title'),
    description: t('onboarding.features.properties.description'),
    action: {
      path: '/dashboard/properties',
      label: t('onboarding.features.properties.action'),
    },
  },
];
</script>
