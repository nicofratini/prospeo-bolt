<template>
  <div
    :class="[
      'flex items-center',
      className
    ]"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600 dark:focus:ring-primary-400 disabled:cursor-not-allowed"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <label
      v-if="label"
      :for="id"
      class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  id?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  className: '',
});

defineEmits(['update:modelValue']);

const id = computed(() => props.id || `checkbox-${Math.random().toString(36).slice(2, 11)}`);
</script>