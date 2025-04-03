<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
        {{ t('onboarding.property.title') }}
      </h3>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ t('onboarding.property.description') }}
      </p>
    </div>

    <!-- Success Message -->
    <div
      v-if="propertyAdded"
      class="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg"
    >
      <div class="flex">
        <Icon
          name="heroicons:check-circle"
          class="h-5 w-5 text-green-400 dark:text-green-300"
        />
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800 dark:text-green-200">
            {{ t('onboarding.property.success') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="saveError"
      class="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg"
    >
      <div class="flex">
        <Icon
          name="heroicons:exclamation-circle"
          class="h-5 w-5 text-red-400 dark:text-red-300"
        />
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ saveError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Property Form -->
    <form
      class="space-y-6"
      @submit.prevent="handleSaveProperty"
    >
      <!-- Name -->
      <UiInput
        v-model="form.name"
        :label="t('properties.name')"
        :placeholder="t('properties.namePlaceholder')"
        :error="errors.name"
        required
      />

      <!-- Address -->
      <UiInput
        v-model="form.address"
        :label="t('properties.address')"
        :placeholder="t('properties.addressPlaceholder')"
        :error="errors.address"
      />

      <!-- Property Type -->
      <UiSelect
        v-model="form.property_type"
        :label="t('properties.type')"
        :placeholder="t('properties.typePlaceholder')"
        :options="[
          { value: 'Maison', label: t('properties.types.house') },
          { value: 'Appartement', label: t('properties.types.apartment') },
        ]"
        :error="errors.property_type"
      />

      <!-- Price -->
      <UiInput
        v-model="form.price"
        type="number"
        :label="t('properties.price')"
        :placeholder="t('properties.pricePlaceholder')"
        :error="errors.price"
        min="0"
        step="0.01"
      />

      <!-- Submit Button -->
      <div class="flex justify-end">
        <UiButton
          type="submit"
          variant="primary"
          :loading="isSavingProperty"
          :disabled="isSavingProperty"
        >
          {{ t('onboarding.property.addButton') }}
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

definePageMeta({
  layout: 'onboarding',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const { setCanProceed } = inject('onboardingNavigation') as {
  setCanProceed: (value: boolean) => void;
};

// Form state
const form = ref({
  name: '',
  address: '',
  property_type: '',
  price: '',
});

const errors = ref({
  name: '',
  address: '',
  property_type: '',
  price: '',
});

const isSavingProperty = ref(false);
const saveError = ref<string | null>(null);
const propertyAdded = ref(false);

// Validation schema
const propertySchema = z.object({
  name: z.string().min(1, t('properties.errors.nameRequired')),
  address: z.string().optional(),
  property_type: z.enum(['Maison', 'Appartement']).optional(),
  price: z.string().transform((val) => {
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }).nullable(),
});

// Watch propertyAdded to control progression
watch(propertyAdded, (newValue) => {
  setCanProceed(newValue);
}, { immediate: true });

// Clear errors when form changes
watch(form, () => {
  errors.value = {
    name: '',
    address: '',
    property_type: '',
    price: '',
  };
  saveError.value = null;
}, { deep: true });

// Handle form submission
async function handleSaveProperty() {
  try {
    isSavingProperty.value = true;
    saveError.value = null;

    // Validate form data
    const validatedData = propertySchema.parse(form.value);

    // Create property
    await $fetch('/api/properties', {
      method: 'POST',
      body: {
        ...validatedData,
        status: 'active', // Default status for new properties
      },
    });

    // Success! Mark property as added
    propertyAdded.value = true;

    // Clear form
    form.value = {
      name: '',
      address: '',
      property_type: '',
      price: '',
    };
  }
  catch (err) {
    console.error('Error saving property:', err);

    if (err instanceof z.ZodError) {
      // Map validation errors to form fields
      err.errors.forEach((error) => {
        if (error.path[0] && error.path[0] in errors.value) {
          errors.value[error.path[0] as keyof typeof errors.value] = error.message;
        }
      });
    }
    else {
      // Handle API errors
      saveError.value = err.data?.message || t('properties.errors.saveFailed');
    }
  }
  finally {
    isSavingProperty.value = false;
  }
}
</script>
