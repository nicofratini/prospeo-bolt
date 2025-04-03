<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('properties.editTitle') }}
      </h1>
      <UiButton
        :to="localePath('/dashboard/properties')"
        variant="ghost"
        :icon="'heroicons:arrow-left'"
      >
        {{ t('common.back') }}
      </UiButton>
    </div>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="flex justify-center items-center py-12"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
    </div>

    <!-- Error state -->
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
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ error.message || t('properties.loadError') }}
          </h3>
          <div class="mt-2">
            <UiButton
              variant="outline"
              size="sm"
              @click="refresh"
            >
              {{ t('common.retry') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit form -->
    <div
      v-else-if="property"
      class="bg-white dark:bg-gray-800 shadow rounded-lg"
    >
      <form
        class="p-6 space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Server-side error message -->
        <div
          v-if="formError"
          class="p-4 bg-red-50 dark:bg-red-900/50 rounded-md"
        >
          <div class="flex">
            <Icon
              name="heroicons:exclamation-circle"
              class="h-5 w-5 text-red-400 dark:text-red-300"
            />
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ formError }}
              </p>
            </div>
          </div>
        </div>

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

        <!-- Status -->
        <UiSelect
          v-model="form.status"
          :label="t('properties.status')"
          :placeholder="t('properties.statusPlaceholder')"
          :options="[
            { value: 'active', label: t('properties.statuses.active') },
            { value: 'inactive', label: t('properties.statuses.inactive') },
            { value: 'sold', label: t('properties.statuses.sold') },
          ]"
          :error="errors.status"
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

        <!-- Description -->
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ t('properties.description') }}
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            :placeholder="t('properties.descriptionPlaceholder')"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
          />
          <p
            v-if="errors.description"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.description }}
          </p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <UiButton
            :to="localePath('/dashboard/properties')"
            variant="ghost"
            :disabled="isSubmitting"
          >
            {{ t('common.cancel') }}
          </UiButton>
          <UiButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('properties.update') }}
          </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';
import type { Database } from '~/types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const localePath = useLocalePath();

// Get property ID from route
const propertyId = route.params.id as string;

// Fetch property data
const { data: property, pending, error, refresh } = await useFetch<Property>(`/api/properties/${propertyId}`, {
  lazy: false,
  server: true,
});

// Form state
const form = ref({
  name: '',
  address: '',
  property_type: '',
  status: 'active',
  price: '',
  description: '',
});

const errors = ref({
  name: '',
  address: '',
  property_type: '',
  status: '',
  price: '',
  description: '',
});

const isSubmitting = ref(false);
const formError = ref('');

// Initialize form with property data
watch(property, (newProperty) => {
  if (newProperty) {
    form.value = {
      name: newProperty.name,
      address: newProperty.address || '',
      property_type: newProperty.property_type || '',
      status: newProperty.status,
      price: newProperty.price?.toString() || '',
      description: newProperty.description || '',
    };
  }
}, { immediate: true });

// Form validation schema
const schema = z.object({
  name: z.string().min(1, t('properties.errors.nameRequired')),
  address: z.string().optional(),
  property_type: z.enum(['Maison', 'Appartement']).optional(),
  status: z.enum(['active', 'inactive', 'sold']).default('active'),
  price: z.string().transform((val) => {
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }).nullable(),
  description: z.string().optional(),
});

// Clear field error when value changes
watch(form, () => {
  errors.value = {
    name: '',
    address: '',
    property_type: '',
    status: '',
    price: '',
    description: '',
  };
  formError.value = '';
}, { deep: true });

// Submit handler
async function handleSubmit() {
  try {
    isSubmitting.value = true;
    formError.value = '';

    // Validate form
    const validatedData = schema.parse(form.value);

    // Submit to API
    const response = await $fetch<Property>(`/api/properties/${propertyId}`, {
      method: 'PUT',
      body: validatedData,
    });

    // Redirect to properties list on success
    if (response) {
      router.push(localePath('/dashboard/properties'));
    }
  }
  catch (err: any) {
    if (err instanceof z.ZodError) {
      // Map validation errors to form fields
      err.errors.forEach((error) => {
        if (error.path[0] && error.path[0] in errors.value) {
          errors.value[error.path[0] as keyof typeof errors.value] = error.message;
        }
      });
    }
    else if (err.data?.message) {
      // Handle API error response
      formError.value = err.data.message;
    }
    else {
      // Handle unexpected errors
      formError.value = err.message || t('common.error');
    }
  }
  finally {
    isSubmitting.value = false;
  }
}
</script>
