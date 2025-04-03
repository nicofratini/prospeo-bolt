<template>
  <div>
    <!-- Header with title and add button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('properties.title') }}
      </h1>
      <UiButton
        :to="localePath('/dashboard/properties/add')"
        variant="primary"
        :icon="'heroicons:plus'"
      >
        {{ t('properties.add') }}
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
            {{ t('properties.loadError') }}
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

    <!-- Empty state -->
    <div
      v-else-if="!properties?.length"
      class="text-center py-12"
    >
      <Icon
        name="heroicons:home"
        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ t('properties.noProperties') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('properties.getStarted') }}
      </p>
      <div class="mt-6">
        <UiButton
          :to="localePath('/dashboard/properties/add')"
          variant="primary"
          :icon="'heroicons:plus'"
        >
          {{ t('properties.add') }}
        </UiButton>
      </div>
    </div>

    <!-- Properties list -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('properties.name') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('properties.type') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('properties.status') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('properties.price') }}
            </th>
            <th
              scope="col"
              class="relative px-6 py-3"
            >
              <span class="sr-only">{{ t('common.actions') }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="property in properties"
            :key="property.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ property.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ property.address }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ property.property_type }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': property.status === 'active',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': property.status === 'inactive',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': property.status === 'sold',
                }"
              >
                {{ t(`properties.statuses.${property.status}`) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatPrice(property.price) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <UiButton
                  :to="localePath(`/dashboard/properties/${property.id}`)"
                  variant="ghost"
                  size="sm"
                  :icon="'heroicons:eye'"
                >
                  {{ t('common.view') }}
                </UiButton>
                <UiButton
                  :to="localePath(`/dashboard/properties/${property.id}/edit`)"
                  variant="ghost"
                  size="sm"
                  :icon="'heroicons:pencil-square'"
                >
                  {{ t('common.edit') }}
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  :icon="'heroicons:trash'"
                  class="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                  :disabled="deletingPropertyId === property.id"
                  @click="handleDeleteProperty(property.id)"
                >
                  <Icon
                    v-if="deletingPropertyId === property.id"
                    name="heroicons:arrow-path"
                    class="animate-spin h-4 w-4"
                  />
                  <span v-else>{{ t('common.delete') }}</span>
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Database } from '~/types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const localePath = useLocalePath();

// Fetch properties
const { data: { properties } = { properties: [] }, pending, error, refresh } = await useFetch<{ properties: Property[] }>('/api/properties', {
  lazy: false,
  server: true,
});

// Delete state
const deletingPropertyId = ref<string | null>(null);

// Format price with currency
function formatPrice(price: number | null) {
  if (!price) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

// Delete handler
async function handleDeleteProperty(propertyId: string) {
  // Show confirmation dialog
  if (!confirm(t('properties.confirmDelete'))) {
    return;
  }

  try {
    deletingPropertyId.value = propertyId;

    // Send delete request
    await $fetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
    });

    // Refresh the properties list
    refresh();
  }
  catch (err: any) {
    console.error('Error deleting property:', err);
    alert(err.data?.message || t('properties.deleteError'));
  }
  finally {
    deletingPropertyId.value = null;
  }
}
</script>
