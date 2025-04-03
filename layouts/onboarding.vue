<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center space-x-2"
        >
          <Icon
            name="heroicons:cube-transparent"
            class="h-10 w-10 text-primary-600 dark:text-primary-400"
          />
          <span class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('common.appName') }}
          </span>
        </NuxtLink>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('onboarding.step', { current: progress.current, total: progress.total }) }}
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ progress.percentage }}%
          </span>
        </div>
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-2 bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300"
            :style="{ width: `${progress.percentage}%` }"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <!-- Step Title -->
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {{ currentStepTitle }}
          </h2>

          <!-- Page Content -->
          <slot />
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="mt-6 flex justify-between">
        <div class="flex gap-2">
          <UiButton
            v-if="!isFirstStep"
            variant="outline"
            :icon="'heroicons:arrow-left'"
            @click="goBack"
          >
            {{ t('onboarding.back') }}
          </UiButton>
          <UiButton
            v-if="isSkippable"
            variant="ghost"
            @click="skipStep"
          >
            {{ t('onboarding.skip') }}
          </UiButton>
        </div>

        <UiButton
          variant="primary"
          :icon="isLastStep ? 'heroicons:check' : 'heroicons:arrow-right'"
          :icon-position="isLastStep ? 'left' : 'right'"
          :disabled="!canProceed"
          @click="goNext"
        >
          {{ isLastStep ? t('onboarding.finish') : t('onboarding.next') }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useOnboardingState } from '~/composables/useOnboardingState';

const { t } = useI18n();
const localePath = useLocalePath();

// Use the onboarding state composable
const {
  currentStepTitle,
  isFirstStep,
  isLastStep,
  canProceed,
  isSkippable,
  progress,
  goBack,
  goNext,
  skipStep,
  setCanProceed,
} = useOnboardingState();

// Provide navigation methods to child components
provide('onboardingNavigation', {
  goBack,
  goNext,
  skipStep,
  setCanProceed,
});
</script>