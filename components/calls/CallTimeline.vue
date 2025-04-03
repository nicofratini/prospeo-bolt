<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ t('calls.timeline') }}
      </h3>

      <!-- No timeline data available -->
      <div
        v-if="!transcript?.segments?.length"
        class="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('calls.noTimeline') }}
        </p>
      </div>

      <!-- Timeline content -->
      <div
        v-else
        class="relative"
      >
        <!-- Timeline axis -->
        <div
          class="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />

        <!-- Timeline items -->
        <div class="space-y-6">
          <div
            v-for="(segment, index) in transcript.segments"
            :key="index"
            class="relative pl-12"
          >
            <!-- Timeline dot -->
            <div
              class="absolute left-5 -ml-px mt-3 h-3 w-3 rounded-full border-2"
              :class="{
                'bg-primary-100 dark:bg-primary-900 border-primary-500 dark:border-primary-400': segment.speaker === 'agent',
                'bg-gray-100 dark:bg-gray-900 border-gray-500 dark:border-gray-400': segment.speaker === 'caller'
              }"
              aria-hidden="true"
            />

            <!-- Timeline content -->
            <div class="flex min-w-0 flex-1 justify-between space-x-4">
              <div>
                <!-- Speaker and timestamp -->
                <div class="flex items-center gap-2 text-sm">
                  <span
                    class="font-medium"
                    :class="{
                      'text-primary-600 dark:text-primary-400': segment.speaker === 'agent',
                      'text-gray-600 dark:text-gray-400': segment.speaker === 'caller'
                    }"
                  >
                    {{ t(`calls.speakers.${segment.speaker}`) }}
                  </span>
                  <span
                    v-if="segment.start_time"
                    class="text-gray-500 dark:text-gray-400"
                  >
                    {{ formatTimestamp(segment.start_time) }}
                  </span>
                </div>

                <!-- Message text -->
                <p
                  class="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
                  :class="{ 'line-clamp-2': !expandedSegments[index] }"
                >
                  {{ segment.text }}
                </p>

                <!-- Expand/collapse button for long messages -->
                <button
                  v-if="segment.text.length > 150"
                  class="mt-1 text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none"
                  @click="toggleSegment(index)"
                >
                  {{ expandedSegments[index] ? t('common.showLess') : t('common.showMore') }}
                </button>
              </div>
            </div>
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

// State for expanded/collapsed segments
const expandedSegments = ref<Record<number, boolean>>({});

// Format timestamp (seconds) to MM:SS format
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Toggle segment expansion
function toggleSegment(index: number) {
  expandedSegments.value[index] = !expandedSegments.value[index];
}
</script>
```