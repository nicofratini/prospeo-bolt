<template>
  <div>
    <!-- Header with back button -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('calls.detailTitle') }}
      </h1>
      <UiButton
        :to="localePath('/dashboard/call-history')"
        variant="ghost"
        :icon="'heroicons:arrow-left'"
      >
        {{ t('common.back') }}
      </UiButton>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center items-center py-12"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg"
    >
      <div class="flex">
        <Icon
          name="heroicons:exclamation-circle"
          class="h-5 w-5 text-red-400 dark:text-red-300"
        />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ error.message === 'Call not found' ? t('calls.notFound') : t('calls.loadError') }}
          </h3>
          <div class="mt-2">
            <UiButton
              variant="outline"
              size="sm"
              @click="refresh"
            >
              {{ t('common.retry') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Call Details -->
    <div
      v-else-if="callDetails"
      class="space-y-6"
    >
      <!-- Main Info Card -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Date/Time -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('calls.date') }}
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(callDetails.call_timestamp) }}
              </dd>
            </div>

            <!-- Caller Number -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('calls.caller') }}
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatPhoneNumber(callDetails.caller_number) }}
              </dd>
            </div>

            <!-- Duration -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('calls.duration') }}
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDuration(callDetails.duration_seconds) }}
              </dd>
            </div>

            <!-- Status -->
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('calls.status') }}
              </dt>
              <dd class="mt-1">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': callDetails.status === 'completed',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': callDetails.status === 'in-progress',
                    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': callDetails.status === 'failed' || callDetails.status === 'missed',
                  }"
                >
                  {{ t(`calls.statuses.${callDetails.status}`) }}
                </span>
              </dd>
            </div>

            <!-- Property -->
            <div v-if="callDetails.property">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('calls.property') }}
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                <NuxtLink
                  :to="localePath(`/dashboard/properties/${callDetails.property.id}`)"
                  class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {{ callDetails.property.name }}
                </NuxtLink>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ callDetails.property.address }}
                </p>
              </dd>
            </div>

            <!-- AI Agent -->
            <div v-if="callDetails.ai_agent">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('calls.agent') }}
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ callDetails.ai_agent.agent_name }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Tags Section -->
      <TagManager :call-id="callDetails.id" />

      <!-- Recording Section -->
      <div
        v-if="callDetails.recording_url"
        class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
      >
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {{ t('calls.recording') }}
          </h3>
          <UiAudioPlayer :src="callDetails.recording_url" />
        </div>
      </div>

      <!-- Summary Section -->
      <div
        v-if="callDetails.summary"
        class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
      >
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {{ t('calls.summary') }}
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ callDetails.summary }}
          </p>
        </div>
      </div>

      <!-- Timeline Section -->
      <CallTimeline :transcript="callDetails.transcript" />

      <!-- Transcript Section -->
      <TranscriptViewer :transcript="callDetails.transcript" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Database } from '~/types/supabase';
import TranscriptViewer from '~/components/calls/TranscriptViewer.vue';
import TagManager from '~/components/tags/TagManager.vue';
import CallTimeline from '~/components/calls/CallTimeline.vue';
import UiAudioPlayer from '~/components/ui/UiAudioPlayer.vue';

type CallHistory = Database['public']['Tables']['call_history']['Row'];

interface CallWithRelations extends CallHistory {
  property: {
    id: string;
    name: string;
    address: string;
  } | null;
  ai_agent: {
    id: string;
    agent_name: string;
  } | null;
}

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();

// Get call ID from route params
const callId = computed(() => route.params.id as string);

// Fetch call details
const { data: callDetails, pending, error, refresh } = await useFetch<CallWithRelations>(() => `/api/calls/${callId.value}`, {
  lazy: false,
  server: true,
});

// Formatting helpers
function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

function formatPhoneNumber(number: string) {
  // Basic phone number formatting - can be enhanced based on requirements
  return number;
}

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return t('calls.noDuration');
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
</script>
