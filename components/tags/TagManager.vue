<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ t('calls.tags') }}
      </h3>

      <!-- Loading States -->
      <div
        v-if="isLoadingAssigned || isLoadingAvailable"
        class="flex justify-center items-center py-6"
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

      <div v-else>
        <!-- Assigned Tags -->
        <div class="mb-4">
          <div
            v-if="assignedTags.length === 0"
            class="text-sm text-gray-500 dark:text-gray-400 mb-2"
          >
            {{ t('calls.noTags') }}
          </div>
          <div
            v-else
            class="flex flex-wrap gap-2"
          >
            <div
              v-for="tag in assignedTags"
              :key="tag.id"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium"
              :style="tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}"
              :class="tag.color ? '' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'"
            >
              {{ tag.name }}
              <button
                :disabled="isRemoving === tag.id"
                class="ml-0.5 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                @click="removeTag(tag.id)"
              >
                <Icon
                  v-if="isRemoving === tag.id"
                  name="heroicons:arrow-path"
                  class="h-4 w-4 animate-spin"
                />
                <Icon
                  v-else
                  name="heroicons:x-mark"
                  class="h-4 w-4"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Add Tag Form -->
        <div class="flex gap-2">
          <UiSelect
            v-model="selectedTagToAdd"
            :placeholder="t('calls.selectTag')"
            :options="availableTagOptions"
            class="flex-1"
          />
          <UiButton
            variant="primary"
            size="sm"
            :loading="isAdding"
            :disabled="isAdding || !selectedTagToAdd"
            @click="addTag"
          >
            {{ t('calls.addTag') }}
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Database } from '~/types/supabase';

type Tag = Database['public']['Tables']['tags']['Row'];

interface Props {
  callId: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

// State
const assignedTags = ref<Tag[]>([]);
const availableTags = ref<Tag[]>([]);
const selectedTagToAdd = ref<string | null>(null);
const isLoadingAssigned = ref(false);
const isLoadingAvailable = ref(false);
const isAdding = ref(false);
const isRemoving = ref<string | null>(null);
const error = ref<string | null>(null);

// Computed
const availableTagOptions = computed(() => {
  const assignedIds = new Set(assignedTags.value.map(tag => tag.id));
  return availableTags.value
    .filter(tag => !assignedIds.has(tag.id))
    .map(tag => ({
      value: tag.id,
      label: tag.name,
    }));
});

// Methods
async function fetchAssignedTags() {
  try {
    isLoadingAssigned.value = true;
    error.value = null;

    const tags = await $fetch<Tag[]>(`/api/calls/${props.callId}/tags`);
    assignedTags.value = tags;
  }
  catch (err: any) {
    console.error('Error fetching assigned tags:', err);
    error.value = err.data?.message || t('calls.loadTagsError');
  }
  finally {
    isLoadingAssigned.value = false;
  }
}

async function fetchAvailableTags() {
  try {
    isLoadingAvailable.value = true;
    error.value = null;

    const tags = await $fetch<Tag[]>('/api/tags');
    availableTags.value = tags;
  }
  catch (err: any) {
    console.error('Error fetching available tags:', err);
    error.value = err.data?.message || t('calls.loadTagsError');
  }
  finally {
    isLoadingAvailable.value = false;
  }
}

async function addTag() {
  if (!selectedTagToAdd.value) return;

  try {
    isAdding.value = true;
    error.value = null;

    await $fetch(`/api/calls/${props.callId}/tags`, {
      method: 'POST',
      body: {
        tag_id: selectedTagToAdd.value,
      },
    });

    // Refresh assigned tags and reset selection
    await fetchAssignedTags();
    selectedTagToAdd.value = null;
  }
  catch (err: any) {
    console.error('Error adding tag:', err);
    error.value = err.data?.message || t('calls.addTagError');
  }
  finally {
    isAdding.value = false;
  }
}

async function removeTag(tagId: string) {
  try {
    isRemoving.value = tagId;
    error.value = null;

    await $fetch(`/api/calls/${props.callId}/tags/${tagId}`, {
      method: 'DELETE',
    });

    // Refresh assigned tags
    await fetchAssignedTags();
  }
  catch (err: any) {
    console.error('Error removing tag:', err);
    error.value = err.data?.message || t('calls.removeTagError');
  }
  finally {
    isRemoving.value = null;
  }
}

async function refresh() {
  error.value = null;
  await Promise.all([
    fetchAssignedTags(),
    fetchAvailableTags(),
  ]);
}

// Initialize
onMounted(refresh);
</script>