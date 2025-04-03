<template>
  <div class="w-full">
    <!-- Audio element (hidden but functional) -->
    <audio
      ref="audioElement"
      :src="src"
      preload="metadata"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
      @error="handleError"
    >
      {{ t('common.audioNotSupported') }}
    </audio>

    <!-- Custom controls -->
    <div class="flex flex-col space-y-2">
      <!-- Play/Pause and Time Display -->
      <div class="flex items-center space-x-4">
        <button
          class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          :disabled="!isLoaded || error"
          @click="togglePlay"
        >
          <Icon
            :name="isPlaying ? 'heroicons:pause' : 'heroicons:play'"
            class="w-5 h-5 text-primary-600 dark:text-primary-400"
          />
        </button>

        <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{{ formatTime(currentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="relative flex-1">
        <input
          type="range"
          :value="currentTime"
          :max="duration"
          :disabled="!isLoaded || error"
          class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-400"
          @input="handleSeek"
        >
      </div>

      <!-- Error Message -->
      <p
        v-if="error"
        class="text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
  src: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

// State
const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isLoaded = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const error = ref<string | null>(null);

// Methods
function togglePlay() {
  if (!audioElement.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
  }
  else {
    audioElement.value.play();
  }

  isPlaying.value = !isPlaying.value;
}

function handleTimeUpdate() {
  if (!audioElement.value) return;
  currentTime.value = audioElement.value.currentTime;
}

function handleLoadedMetadata() {
  if (!audioElement.value) return;
  duration.value = audioElement.value.duration;
  isLoaded.value = true;
  error.value = null;
}

function handleEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
}

function handleError() {
  error.value = t('common.audioLoadError');
  isPlaying.value = false;
  isLoaded.value = false;
}

function handleSeek(event: Event) {
  if (!audioElement.value) return;
  const target = event.target as HTMLInputElement;
  const time = Number(target.value);
  audioElement.value.currentTime = time;
  currentTime.value = time;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Cleanup
onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
  }
});
</script>

<style scoped>
/* Custom range input styling */
input[type="range"]::-webkit-slider-thumb {
  @apply w-4 h-4 bg-primary-600 dark:bg-primary-400 rounded-full;
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-moz-range-thumb {
  @apply w-4 h-4 bg-primary-600 dark:bg-primary-400 rounded-full border-0;
}

input[type="range"]:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>