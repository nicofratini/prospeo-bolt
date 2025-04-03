<template>
  <div :class="className">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        ref="input"
        v-bind="$attrs"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm text-gray-900 dark:text-white',
          'focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
          'disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'dark:bg-gray-700',
          error && 'border-red-500 dark:border-red-500',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <Icon
        v-if="icon"
        :name="icon"
        class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
      />
    </div>
    <p
      v-if="error"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
    <p
      v-if="hint"
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  icon?: string
  id?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  className: '',
});

defineEmits(['update:modelValue']);

const input = ref<HTMLInputElement | null>(null);

const id = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 11)}`);
</script>