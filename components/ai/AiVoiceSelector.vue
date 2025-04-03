<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center py-8"
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
          <p class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ error }}
          </p>
          <div class="mt-2">
            <UiButton
              variant="outline"
              size="sm"
              @click="fetchVoices"
            >
              {{ t('common.retry') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Selection -->
    <div v-else>
      <!-- Filters -->
      <div class="grid gap-4 md:grid-cols-2 mb-6">
        <UiSelect
          v-model="filters.language"
          :label="t('ai.voices.language')"
          :placeholder="t('ai.voices.languagePlaceholder')"
          :options="languageOptions"
        />
        <UiSelect
          v-model="filters.gender"
          :label="t('ai.voices.gender')"
          :placeholder="t('ai.voices.genderPlaceholder')"
          :options="genderOptions"
        />
      </div>

      <!-- Voices Grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="voice in filteredVoices"
          :key="voice.id"
          class="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md"
          :class="{
            'ring-2 ring-primary-500 dark:ring-primary-400': selectedVoiceId === voice.id
          }"
        >
          <div class="p-4">
            <!-- Voice Name and Category -->
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ voice.name }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ voice.category }}
                </p>
              </div>
              <button
                class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                :class="{ 'text-primary-500': selectedVoiceId === voice.id }"
                @click="selectVoice(voice.id)"
              >
                <Icon
                  :name="selectedVoiceId === voice.id ? 'heroicons:check-circle' : 'heroicons:play-circle'"
                  class="h-6 w-6"
                />
              </button>
            </div>

            <!-- Voice Description -->
            <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {{ voice.description }}
            </p>

            <!-- Voice Labels -->
            <div class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="label in voice.labels"
                :key="label"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {{ label }}
              </span>
            </div>

            <!-- Preview Button -->
            <div class="mt-4">
              <UiButton
                variant="outline"
                size="sm"
                class="w-full"
                :loading="isPreviewLoading && previewVoiceId === voice.id"
                :disabled="isPreviewLoading"
                @click="previewVoice(voice)"
              >
                {{ t('ai.voices.preview') }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTextToSpeech } from '~/composables/useTextToSpeech';

interface Voice {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string;
  settings: Record<string, unknown>;
  labels: string[];
}

interface Props {
  modelValue: string | null;
  availableVoices?: Voice[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  availableVoices: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const { t } = useI18n();
const { generateSpeech } = useTextToSpeech();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const voices = ref<Voice[]>([]);
const selectedVoiceId = ref(props.modelValue);
const isPreviewLoading = ref(false);
const previewVoiceId = ref<string | null>(null);

// Filters
const filters = ref({
  language: '',
  gender: '',
});

// Filter options
const languageOptions = [
  { value: '', label: t('ai.voices.allLanguages') },
  { value: 'en', label: t('common.english') },
  { value: 'fr', label: t('common.french') },
];

const genderOptions = [
  { value: '', label: t('ai.voices.allGenders') },
  { value: 'male', label: t('ai.voices.male') },
  { value: 'female', label: t('ai.voices.female') },
];

// Computed
const filteredVoices = computed(() => {
  let filtered = props.availableVoices || voices.value;

  if (filters.value.language) {
    filtered = filtered.filter(voice => 
      voice.labels.some(label => label.toLowerCase().includes(filters.value.language))
    );
  }

  if (filters.value.gender) {
    filtered = filtered.filter(voice => 
      voice.labels.some(label => label.toLowerCase() === filters.value.gender)
    );
  }

  return filtered;
});

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  selectedVoiceId.value = newValue;
});

// Methods
async function fetchVoices() {
  if (props.availableVoices) return;

  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch<{ voices: Voice[] }>('/api/ai/voices');
    voices.value = response.voices;
  }
  catch (err: any) {
    console.error('Error fetching voices:', err);
    error.value = err.data?.message || t('ai.voices.loadError');
  }
  finally {
    isLoading.value = false;
  }
}

function selectVoice(voiceId: string) {
  selectedVoiceId.value = voiceId;
  emit('update:modelValue', voiceId);
}

async function previewVoice(voice: Voice) {
  try {
    isPreviewLoading.value = true;
    previewVoiceId.value = voice.id;

    await generateSpeech(t('ai.voices.previewText'), voice.id);
  }
  catch (err) {
    console.error('Error previewing voice:', err);
  }
  finally {
    isPreviewLoading.value = false;
    previewVoiceId.value = null;
  }
}

// Initialize
onMounted(() => {
  fetchVoices();
});
</script>