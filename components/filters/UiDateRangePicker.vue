<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
    </label>
    <VueDatePicker
      v-model="selectedRange"
      :format="format"
      :locale="locale"
      :placeholder="placeholder"
      :enable-time-picker="false"
      :range="true"
      :auto-apply="true"
      :close-on-auto-apply="true"
      :text-input="true"
      :model-type="modelType"
      class="date-picker"
      :class="{ 'error': error }"
      :dark="isDarkMode"
    />
    <p
      v-if="error"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useThemeStore } from '~/stores/theme';

interface Props {
  modelValue: [Date | null, Date | null];
  label?: string;
  placeholder?: string;
  error?: string;
  format?: string;
  locale?: string;
  modelType?: 'date' | 'timestamp' | 'format';
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  placeholder: undefined,
  error: undefined,
  format: 'dd/MM/yyyy',
  locale: 'fr-FR',
  modelType: 'date',
});

const emit = defineEmits<{
  'update:modelValue': [value: [Date | null, Date | null]];
}>();

const themeStore = useThemeStore();

// Computed
const selectedRange = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isDarkMode = computed(() => themeStore.isDarkMode);
</script>

<style>
.date-picker {
  width: 100%;
}

.date-picker.error :deep(.dp__input) {
  @apply border-red-500 dark:border-red-500;
}

.date-picker :deep(.dp__input) {
  @apply w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white;
}

.date-picker :deep(.dp__main) {
  @apply border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800;
}

.date-picker :deep(.dp__calendar_header) {
  @apply text-gray-900 dark:text-white;
}

.date-picker :deep(.dp__cell_inner) {
  @apply text-gray-900 dark:text-white;
}

.date-picker :deep(.dp__today) {
  @apply border-primary-500 dark:border-primary-400;
}

.date-picker :deep(.dp__active) {
  @apply bg-primary-500 dark:bg-primary-400;
}

.date-picker :deep(.dp__range_start),
.date-picker :deep(.dp__range_end) {
  @apply bg-primary-500 dark:bg-primary-400;
}

.date-picker :deep(.dp__range_between) {
  @apply bg-primary-100 dark:bg-primary-900;
}
</style>