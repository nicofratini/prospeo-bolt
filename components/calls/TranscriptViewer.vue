<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ t('calls.transcript') }}
      </h3>

      <!-- No transcript available -->
      <div
        v-if="!transcript"
        class="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('calls.noTranscript') }}
        </p>
      </div>

      <!-- Transcript content -->
      <div
        v-else
        class="space-y-4"
      >
        <!-- Segments -->
        <div
          v-for="(segment, index) in segments"
          :key="index"
          class="flex gap-4"
          :class="{
            'justify-end': segment.speaker === 'agent'
          }"
        >
          <!-- Message bubble -->
          <div
            class="max-w-[80%] rounded-lg px-4 py-2"
            :class="{
              'bg-primary-50 dark:bg-primary-900/50': segment.speaker === 'agent',
              'bg-gray-100 dark:bg-gray-700': segment.speaker === 'caller'
            }"
          >
            <!-- Speaker label -->
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-xs font-medium"
                :class="{
                  'text-primary-600 dark:text-primary-400': segment.speaker === 'agent',
                  'text-gray-600 dark:text-gray-400': segment.speaker === 'caller'
                }"
              >
                {{ t(`calls.speakers.${segment.speaker}`) }}
              </span>
              <span
                v-if="segment.start_time"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                {{ formatTimestamp(segment.start_time) }}
              </span>
            </div>

            <!-- Message text -->
            <p class="text-sm text-gray-900 dark:text-white whitespace-pre-line">
              {{ segment.text }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface TranscriptSegment {
  speaker: 'agent' | 'caller';
  text: string;
  start_time?: number;
  end_time?: number;
}

interface Props {
  transcript: {
    segments: TranscriptSegment[];
  } | null;
}

const props = defineProps<Props>();
const { t } = useI18n();

// Computed property to get segments array safely
const segments = computed(() => props.transcript?.segments || []);

// Format timestamp (seconds) to MM:SS format
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
</script>