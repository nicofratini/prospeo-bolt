<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      sizes[size],
      className
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <Icon
      v-if="loading"
      name="heroicons:arrow-path"
      class="mr-2 h-4 w-4 animate-spin"
    />
    <Icon
      v-if="icon && !loading"
      :name="icon"
      class="mr-2 h-4 w-4"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  icon?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'default',
  loading: false,
  disabled: false,
  className: '',
});

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-600 dark:hover:bg-secondary-700',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-lg',
  icon: 'h-10 w-10',
};
</script>