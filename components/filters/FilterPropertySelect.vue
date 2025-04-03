<template>
  <div>
    <UiSelect
      v-model="selectedProperty"
      :label="label"
      :placeholder="t('properties.selectProperty')"
      :options="propertyOptions"
      :error="error"
      :disabled="isLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Database } from '~/types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

interface Props {
  modelValue: string | null;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const { t } = useI18n();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const properties = ref<Property[]>([]);

// Computed
const selectedProperty = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const propertyOptions = computed(() => [
  { value: '', label: t('properties.allProperties') },
  ...properties.value.map(property => ({
    value: property.id,
    label: property.name,
  })),
]);

// Methods
async function fetchProperties() {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch<{ properties: Property[] }>('/api/properties');
    properties.value = response.properties;
  }
  catch (err: any) {
    console.error('Error fetching properties:', err);
    error.value = err.data?.message || t('properties.loadError');
  }
  finally {
    isLoading.value = false;
  }
}

// Initialize
onMounted(() => {
  fetchProperties();
});
</script>