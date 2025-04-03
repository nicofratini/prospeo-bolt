<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('calendar.title') }}
    </h1>

    <!-- Calendar and Bookings Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Calendar Section -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ t('calendar.availability') }}
        </h2>

        <!-- Event Type Selection -->
        <div class="mb-6">
          <UiSelect
            v-model="selectedEventTypeId"
            :label="t('calendar.eventType')"
            :placeholder="t('calendar.selectEventType')"
            :options="eventTypeOptions"
            :loading="loadingEventTypes"
            :error="errorEventTypes"
            required
          />
        </div>

        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="flex justify-center py-8"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="bg-red-50 dark:bg-red-900/50 p-4 rounded-md"
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
            </div>
          </div>
        </div>

        <!-- Calendar View -->
        <div v-else>
          <VCalendar
            :attributes="calendarAttributes"
            :locale="locale"
            is-expanded
            borderless
            transparent
            title-position="left"
            class="custom-v-calendar"
            @dayclick="handleDayClick"
          />

          <!-- Selected Day's Availability Slots -->
          <div
            v-if="selectedDay"
            class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-900 dark:text-white">
                {{ formatSelectedDayTitle }}
              </h3>
              <button
                class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1"
                @click="clearSelection"
              >
                <Icon
                  name="heroicons:x-mark"
                  class="h-4 w-4"
                />
                {{ t('common.clear') }}
              </button>
            </div>

            <div
              v-if="selectedDaySlots.length"
              class="grid gap-3 sm:grid-cols-2"
            >
              <button
                v-for="slot in selectedDaySlots"
                :key="slot.id"
                class="group relative flex items-center justify-between px-4 py-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/50 border-primary-500 dark:border-primary-400': selectedSlot?.id === slot.id,
                  'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50': selectedSlot?.id !== slot.id,
                }"
                @click="selectTimeSlot(slot)"
              >
                <span class="flex items-center gap-2">
                  <Icon
                    name="heroicons:clock"
                    class="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                  />
                  <span :class="{ 'text-primary-700 dark:text-primary-300': selectedSlot?.id === slot.id }">
                    {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
                  </span>
                </span>
                <Icon
                  v-if="selectedSlot?.id === slot.id"
                  name="heroicons:check"
                  class="h-4 w-4 text-primary-500 dark:text-primary-400"
                />
              </button>
            </div>
            <div
              v-else
              class="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <Icon
                name="heroicons:calendar"
                class="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
              />
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {{ t('calendar.noSlotsAvailable') }}
              </p>
            </div>

            <div
              v-if="selectedSlot"
              class="mt-4 space-y-4"
            >
              <div
                v-if="bookingError"
                class="p-4 bg-red-50 dark:bg-red-900/50 rounded-md"
              >
                <div class="flex">
                  <Icon
                    name="heroicons:exclamation-circle"
                    class="h-5 w-5 text-red-400 dark:text-red-300"
                  />
                  <div class="ml-3">
                    <p class="text-sm font-medium text-red-800 dark:text-red-200">
                      {{ bookingError }}
                    </p>
                  </div>
                </div>
              </div>

              <UiButton
                variant="primary"
                class="w-full"
                :loading="isBookingSlot"
                :disabled="isBookingSlot || !selectedEventTypeId"
                @click="handleBookSlot(selectedSlot)"
              >
                {{ t('calendar.bookSlot') }}
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Cal.com Integration Button -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <UiButton
            variant="outline"
            class="w-full"
            :icon="'heroicons:calendar'"
          >
            {{ t('calendar.connectCalCom') }}
          </UiButton>
        </div>
      </div>

      <!-- Upcoming Bookings Section -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ t('calendar.upcomingBookings') }}
        </h2>

        <div
          v-if="isLoadingBookings"
          class="flex justify-center py-8"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
        </div>

        <div
          v-else-if="bookingsError"
          class="bg-red-50 dark:bg-red-900/50 p-4 rounded-md"
        >
          <div class="flex">
            <Icon
              name="heroicons:exclamation-circle"
              class="h-5 w-5 text-red-400 dark:text-red-300"
            />
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ bookingsError }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else-if="!bookings.length"
          class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          {{ t('calendar.noBookings') }}
        </div>

        <div
          v-else
          class="divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div
            v-for="booking in bookings"
            :key="booking.id"
            class="py-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ booking.title }}
                </p>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDateTime(booking.startTime) }}
                </p>
                <p
                  v-if="cancelError && cancellingBookingId === booking.id"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ cancelError }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <UiButton
                  variant="ghost"
                  size="sm"
                  :icon="'heroicons:eye'"
                  :to="localePath(`/dashboard/bookings/${booking.id}`)"
                >
                  {{ t('common.view') }}
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  :icon="cancellingBookingId === booking.id ? 'heroicons:arrow-path' : 'heroicons:x-mark'"
                  class="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                  :loading="cancellingBookingId === booking.id"
                  :disabled="cancellingBookingId === booking.id"
                  @click="handleCancelBooking(booking.id)"
                >
                  {{ t('calendar.cancel') }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Calendar as VCalendar } from 'v-calendar';
import type { Attribute } from 'v-calendar';
import 'v-calendar/style.css';

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const localePath = useLocalePath();
const { data: sessionData } = useAuth();

// Types
interface EventType {
  id: number;
  title: string;
  description: string | null;
  length: number;
  price: number;
  currency: string;
}

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
}

// State
const locale = ref('fr-FR');
const selectedDay = ref<Date | null>(null);
const selectedSlot = ref<AvailabilitySlot | null>(null);
const selectedEventTypeId = ref<number | null>(null);
const isBookingSlot = ref(false);
const bookingError = ref<string | null>(null);
const cancellingBookingId = ref<string | null>(null);
const cancelError = ref<string | null>(null);

// Fetch event types
const { data: eventTypesData, pending: loadingEventTypes, error: errorEventTypes } = await useFetch<EventType[]>('/api/calcom/event-types');

// Fetch bookings data
const { data: bookingsData, pending: isLoadingBookings, error: bookingsError, refresh: refreshBookings } = await useFetch<Booking[]>('/api/calcom/bookings', {
  query: {
    dateFrom: new Date().toISOString(),
  },
});

// Fetch availability data
const { data: availabilityData, pending: isLoadingAvailability, error: availabilityError } = await useFetch<AvailabilitySlot[]>('/api/calcom/availability', {
  query: () => ({
    dateFrom: new Date().toISOString(),
    dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    eventTypeId: selectedEventTypeId.value,
  }),
  watch: [selectedEventTypeId],
});

// Computed
const bookings = computed(() => bookingsData.value || []);
const availabilitySlots = computed(() => availabilityData.value || []);
const isLoading = computed(() => isLoadingBookings.value || isLoadingAvailability.value);
const error = computed(() => bookingsError.value || availabilityError.value);

const eventTypeOptions = computed(() => {
  const options = eventTypesData.value?.map(eventType => ({
    value: eventType.id,
    label: `${eventType.title} (${eventType.length}min)`,
  })) || [];

  return [
    { value: '', label: t('calendar.selectEventType'), disabled: true },
    ...options,
  ];
});

const selectedDaySlots = computed(() => {
  if (!selectedDay.value || !availabilitySlots.value) {
    return [];
  }

  const startOfDay = new Date(selectedDay.value);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDay.value);
  endOfDay.setHours(23, 59, 59, 999);

  return availabilitySlots.value.filter((slot) => {
    const slotStartTime = new Date(slot.startTime);
    return slotStartTime >= startOfDay && slotStartTime <= endOfDay;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
});

const formatSelectedDayTitle = computed(() => {
  if (!selectedDay.value) return '';
  return new Date(selectedDay.value).toLocaleDateString(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
});

// Calendar attributes
const calendarAttributes = computed((): Attribute[] => {
  const attrs: Attribute[] = [];

  // Add dots for bookings
  bookings.value.forEach((booking) => {
    const bookingDate = new Date(booking.startTime);
    attrs.push({
      key: `booking-${booking.id}`,
      dot: {
        color: 'blue',
        class: 'bg-primary-500',
      },
      popover: {
        label: booking.title,
      },
      dates: bookingDate,
    });
  });

  // Add highlights for available days
  const availableDays = new Set(
    availabilitySlots.value.map(slot =>
      new Date(slot.startTime).toISOString().split('T')[0],
    ),
  );

  availableDays.forEach((day) => {
    attrs.push({
      key: `available-${day}`,
      highlight: {
        color: 'green',
        fillMode: 'light',
      },
      dates: new Date(day),
    });
  });

  // Add highlight for selected day
  if (selectedDay.value) {
    attrs.push({
      key: 'selected-day',
      highlight: {
        color: 'blue',
        fillMode: 'solid',
      },
      dates: selectedDay.value,
    });
  }

  return attrs;
});

// Methods
async function handleBookSlot(slot: AvailabilitySlot) {
  try {
    if (!selectedEventTypeId.value) {
      bookingError.value = t('calendar.errors.selectEventType');
      return;
    }

    isBookingSlot.value = true;
    bookingError.value = null;

    // Verify user session and required data
    if (!sessionData.value?.user?.email) {
      throw new Error(t('calendar.errors.userEmailRequired'));
    }

    const bookingPayload = {
      eventTypeId: selectedEventTypeId.value,
      start: slot.startTime,
      end: slot.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      responses: {
        name: sessionData.value.user.name || t('calendar.defaultUserName'),
        email: sessionData.value.user.email,
      },
    };

    // Create the booking
    const newBooking = await $fetch('/api/calcom/bookings', {
      method: 'POST',
      body: bookingPayload,
    });

    // Success! Clear selection and refresh bookings
    console.log('Booking successful:', newBooking);
    clearSelection();
    await refreshBookings();
  }
  catch (error: any) {
    console.error('Error booking slot:', error);
    bookingError.value = error.data?.message || error.message || t('calendar.errors.bookingFailed');
  }
  finally {
    isBookingSlot.value = false;
  }
}

async function handleCancelBooking(bookingId: string) {
  // Show confirmation dialog
  if (!confirm(t('calendar.confirmCancel'))) {
    return;
  }

  try {
    cancellingBookingId.value = bookingId;
    cancelError.value = null;

    // Send delete request
    await $fetch(`/api/calcom/bookings/${bookingId}`, {
      method: 'DELETE',
    });

    // Refresh bookings list on success
    await refreshBookings();
  }
  catch (error: any) {
    console.error('Error cancelling booking:', error);
    cancelError.value = error.data?.message || error.message || t('calendar.errors.cancelFailed');
  }
  finally {
    cancellingBookingId.value = null;
  }
}

function handleDayClick(day: { id: string; date: Date }) {
  // If clicking the same day, clear selection
  if (selectedDay.value?.getTime() === day.date.getTime()) {
    clearSelection();
    return;
  }

  selectedDay.value = day.date;
  selectedSlot.value = null;
  bookingError.value = null;
}

function selectTimeSlot(slot: AvailabilitySlot) {
  selectedSlot.value = slot;
  bookingError.value = null;
}

function clearSelection() {
  selectedDay.value = null;
  selectedSlot.value = null;
  bookingError.value = null;
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(datetime: string) {
  return new Date(datetime).toLocaleString(locale.value, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

// Watch for event type changes
watch(selectedEventTypeId, () => {
  // Clear current selections when event type changes
  clearSelection();
});
</script>

<style scoped>
.custom-v-calendar {
  --vc-font-family: theme('fontFamily.sans');
  --vc-text-lg: theme('fontSize.lg');
  --vc-text-sm: theme('fontSize.sm');
  --vc-text-xs: theme('fontSize.xs');

  /* Colors */
  --vc-accent-50: theme('colors.primary.50');
  --vc-accent-100: theme('colors.primary.100');
  --vc-accent-200: theme('colors.primary.200');
  --vc-accent-300: theme('colors.primary.300');
  --vc-accent-400: theme('colors.primary.400');
  --vc-accent-500: theme('colors.primary.500');
  --vc-accent-600: theme('colors.primary.600');
  --vc-accent-700: theme('colors.primary.700');
  --vc-accent-800: theme('colors.primary.800');
  --vc-accent-900: theme('colors.primary.900');
}

.dark .custom-v-calendar {
  --vc-bg: theme('colors.gray.800');
  --vc-border: theme('colors.gray.700');
  --vc-text: theme('colors.white');
  --vc-text-muted: theme('colors.gray.400');
}
</style>
