<template>
  <div class="space-y-8">
    <!-- Welcome Message -->
    <div class="text-center">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('onboarding.welcome.title') }}
      </h3>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
        {{ t('onboarding.welcome.subtitle') }}
      </p>
    </div>

    <!-- Steps Overview -->
    <div class="grid gap-6">
      <div
        v-for="(step, index) in steps"
        :key="step.title"
        class="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
      >
        <!-- Step Number -->
        <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
          <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
            {{ index + 1 }}
          </span>
        </div>

        <!-- Step Content -->
        <div class="flex-1">
          <h4 class="text-base font-medium text-gray-900 dark:text-white">
            {{ step.title }}
          </h4>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ step.description }}
          </p>
        </div>

        <!-- Step Icon -->
        <div class="flex-shrink-0">
          <Icon
            :name="step.icon"
            class="h-6 w-6 text-primary-600 dark:text-primary-400"
          />
        </div>
      </div>
    </div>

    <!-- Time Estimate -->
    <div class="text-center">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('onboarding.welcome.timeEstimate', { minutes: 5 }) }}
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
const { setCanProceed } = inject('onboardingNavigation') as {
  setCanProceed: (value: boolean) => void;
};

// Enable proceeding immediately on welcome page
onMounted(() => {
  setCanProceed(true);
});

// Define onboarding steps
const steps = [
  {
    title: t('onboarding.welcome.steps.property.title'),
    description: t('onboarding.welcome.steps.property.description'),
    icon: 'heroicons:home',
  },
  {
    title: t('onboarding.welcome.steps.ai.title'),
    description: t('onboarding.welcome.steps.ai.description'),
    icon: 'heroicons:chat-bubble-left-right',
  },
  {
    title: t('onboarding.welcome.steps.features.title'),
    description: t('onboarding.welcome.steps.features.description'),
    icon: 'heroicons:sparkles',
  },
];
</script>
