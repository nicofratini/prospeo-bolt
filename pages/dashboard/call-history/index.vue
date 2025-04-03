<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('calls.title') }}
    </h1>

    <!-- Filters Section -->
    <div class="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Date Range Filter -->
        <UiDateRangePicker
          v-model="filters.dateRange"
          :label="t('calls.filters.dateRange')"
          :placeholder="t('calls.filters.dateRangePlaceholder')"
        />

        <!-- Status Filter -->
        <UiSelect
          v-model="filters.status"
          :label="t('calls.filters.status')"
          :placeholder="t('calls.filters.statusPlaceholder')"
          :options="[
            { value: '', label: t('calls.filters.allStatuses') },
            { value: 'completed', label: t('calls.statuses.completed') },
            { value: 'missed', label: t('calls.statuses.missed') },
            { value: 'failed', label: t('calls.statuses.failed') },
            { value: 'in-progress', label: t('calls.statuses.in-progress') },
          ]"
        />

        <!-- Property Filter -->
        <FilterPropertySelect
          v-model="filters.propertyId"
          :label="t('calls.filters.property')"
        />

        <!-- Search Input -->
        <UiInput
          v-model="filters.search"
          :label="t('calls.filters.search')"
          :placeholder="t('calls.filters.searchPlaceholder')"
          type="search"
        />
      </div>

      <!-- Reset Filters Button -->
      <div class="mt-4 flex justify-end">
        <UiButton
          variant="outline"
          size="sm"
          :icon="'heroicons:x-mark'"
          @click="resetFilters"
        >
          {{ t('calls.filters.reset') }}
        </UiButton>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center items-center py-12"
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
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ error }}
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

    <!-- Empty State -->
    <div
      v-else-if="!calls.length"
      class="text-center py-12"
    >
      <Icon
        name="heroicons:phone"
        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ t('calls.noCalls') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('calls.noCallsDescription') }}
      </p>
    </div>

    <!-- Calls Table -->
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
              {{ t('calls.date') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('calls.caller') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('calls.duration') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('calls.status') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ t('calls.property') }}
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
            v-for="call in calls"
            :key="call.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatDate(call.call_timestamp) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatPhoneNumber(call.caller_number) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatDuration(call.duration_seconds) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': call.status === 'completed',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': call.status === 'in-progress',
                  'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': call.status === 'failed' || call.status === 'missed',
                }"
              >
                {{ t(`calls.statuses.${call.status}`) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ call.property?.name || t('calls.noProperty') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <UiButton
                :to="localePath(`/dashboard/call-history/${call.id}`)"
                variant="ghost"
                size="sm"
                :icon="'heroicons:eye'"
              >
                {{ t('common.view') }}
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <UiButton
            :disabled="pagination.currentPage === 1"
            variant="outline"
            size="sm"
            @click="goToPage(pagination.currentPage - 1)"
          >
            {{ t('common.previous') }}
          </UiButton>
          <UiButton
            :disabled="pagination.currentPage === pagination.totalPages"
            variant="outline"
            size="sm"
            @click="goToPage(pagination.currentPage + 1)"
          >
            {{ t('common.next') }}
          </UiButton>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ t('common.showing') }}
              <span class="font-medium">{{ ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1 }}</span>
              {{ t('common.to') }}
              <span class="font-medium">{{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }}</span>
              {{ t('common.of') }}
              <span class="font-medium">{{ pagination.totalItems }}</span>
              {{ t('common.results') }}
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <UiButton
                :disabled="pagination.currentPage === 1"
                variant="outline"
                size="sm"
                class="rounded-l-md"
                @click="goToPage(pagination.currentPage - 1)"
              >
                <Icon
                  name="heroicons:chevron-left"
                  class="h-5 w-5"
                />
                <span class="sr-only">{{ t('common.previous') }}</span>
              </UiButton>
              <UiButton
                v-for="page in displayedPages"
                :key="page"
                variant="outline"
                size="sm"
                :class="{
                  'z-10 bg-primary-50 dark:bg-primary-900/50 border-primary-500 text-primary-600 dark:text-primary-400': page === pagination.currentPage,
                  'hover:bg-gray-50 dark:hover:bg-gray-700': page !== pagination.currentPage,
                }"
                @click="goToPage(page)"
              >
                {{ page }}
              </UiButton>
              <UiButton
                :disabled="pagination.currentPage === pagination.totalPages"
                variant="outline"
                size="sm"
                class="rounded-r-md"
                @click="goToPage(pagination.currentPage + 1)"
              >
                <Icon
                  name="heroicons:chevron-right"
                  class="h-5 w-5"
                />
                <span class="sr-only">{{ t('common.next') }}</span>
              </UiButton>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDebounce } from '@vueuse/core';
import type { Database } from '~/types/supabase';
import FilterPropertySelect from '~/components/filters/FilterPropertySelect.vue';
import UiDateRangePicker from '~/components/filters/UiDateRangePicker.vue';

type CallHistory = Database['public']['Tables']['call_history']['Row'];

interface CallWithProperty extends CallHistory {
  property: {
    id: string;
    name: string;
  } | null;
}

interface PaginatedResponse {
  calls: CallWithProperty[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();

// Filter state
const filters = reactive({
  dateRange: [null, null] as [Date | null, Date | null],
  status: '',
  propertyId: null as string | null,
  search: '',
});

// Debounce search input
const debouncedSearch = useDebounce(computed(() => filters.search), 300);

// Pagination state
const currentPage = ref(parseInt(route.query.page as string) || 1);
const itemsPerPage = ref(10);

// Query parameters for API
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: itemsPerPage.value,
  search: debouncedSearch.value,
  status: filters.status || undefined,
  propertyId: filters.propertyId || undefined,
  startDate: filters.dateRange[0]?.toISOString() || undefined,
  endDate: filters.dateRange[1]?.toISOString() || undefined,
}));

// Fetch calls data
const { data, pending, error, refresh } = await useFetch<PaginatedResponse>('/api/calls', {
  query: queryParams,
  watch: [queryParams],
  lazy: false,
  server: true,
});

// Computed properties
const calls = computed(() => data.value?.calls || []);
const pagination = computed(() => data.value?.pagination || {
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,
});

// Calculate displayed page numbers
const displayedPages = computed(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.currentPage;
  const delta = 2; // Number of pages to show on each side of current page
  const pages: number[] = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 // First page
      || i === total // Last page
      || (i >= current - delta && i <= current + delta) // Pages around current
    ) {
      pages.push(i);
    }
  }

  return pages;
});

// Watch filters to reset pagination
watch([
  () => filters.dateRange,
  () => filters.status,
  () => filters.propertyId,
  debouncedSearch,
], () => {
  currentPage.value = 1;
}, { deep: true });

// Navigation
async function goToPage(page: number) {
  if (page < 1 || page > pagination.value.totalPages) {
    return;
  }

  currentPage.value = page;
  await router.push({
    query: {
      ...route.query,
      page: page.toString(),
    },
  });
}

// Reset filters
function resetFilters() {
  filters.dateRange = [null, null];
  filters.status = '';
  filters.propertyId = null;
  filters.search = '';
  currentPage.value = 1;
}

// Formatting helpers
function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

function formatPhoneNumber(number: string) {
  // Basic phone number formatting - can be enhanced based on requirements
  return number;
}

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return t('calls.noDuration');
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
</script>
