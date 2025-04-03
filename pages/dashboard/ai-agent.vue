<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('ai.agent.title') }}
    </h1>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <!-- Loading State -->
      <div
        v-if="isLoadingConfig"
        class="p-6 flex justify-center items-center"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="loadingError"
        class="p-6"
      >
        <div class="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
          <div class="flex">
            <Icon
              name="heroicons:exclamation-circle"
              class="h-5 w-5 text-red-400 dark:text-red-300"
            />
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ loadingError }}
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
      </div>

      <!-- Form -->
      <form
        v-else
        class="p-6 space-y-6"
        @submit.prevent="handleSaveAgent"
      >
        <!-- Error message -->
        <div
          v-if="error"
          class="p-4 bg-red-50 dark:bg-red-900/50 rounded-md"
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

        <!-- Success message -->
        <div
          v-if="showSuccess"
          class="p-4 bg-green-50 dark:bg-green-900/50 rounded-md"
        >
          <div class="flex">
            <Icon
              name="heroicons:check-circle"
              class="h-5 w-5 text-green-400 dark:text-green-300"
            />
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800 dark:text-green-200">
                {{ t('ai.agent.saveSuccess') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Agent Name -->
        <UiInput
          v-model="agentName"
          :label="t('ai.agent.name')"
          :placeholder="t('ai.agent.namePlaceholder')"
          :error="errors.agentName"
          required
        />

        <!-- Voice Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('ai.agent.voice') }}
          </label>
          <AiVoiceSelector v-model="selectedVoiceId" />
          <p
            v-if="errors.voiceId"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.voiceId }}
          </p>
        </div>

        <!-- System Prompt -->
        <div>
          <label
            for="systemPrompt"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ t('ai.agent.systemPrompt') }}
          </label>
          <textarea
            id="systemPrompt"
            v-model="systemPrompt"
            rows="6"
            :placeholder="t('ai.agent.systemPromptPlaceholder')"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
          />
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {{ t('ai.agent.systemPromptHelp') }}
          </p>
          <p
            v-if="errors.systemPrompt"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.systemPrompt }}
          </p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <UiButton
            type="submit"
            variant="primary"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ t('ai.agent.save') }}
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
import AiVoiceSelector from '~/components/ai/AiVoiceSelector.vue';

type AiAgent = Database['public']['Tables']['ai_agents']['Row'];

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();

// Form state
const agentName = ref('');
const selectedVoiceId = ref<string | null>(null);
const systemPrompt = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const showSuccess = ref(false);
const errors = reactive({
  agentName: '',
  voiceId: '',
  systemPrompt: '',
});

// Validation schema
const formSchema = z.object({
  agent_name: z.string().min(1, t('ai.agent.errors.nameRequired')),
  elevenlabs_voice_id: z.string().min(1, t('ai.agent.errors.voiceRequired')),
  system_prompt: z.string().optional(),
});

// Fetch existing configuration
const { data: existingConfig, pending: isLoadingConfig, error: loadingError, refresh } = await useFetch<AiAgent | null>('/api/ai/agent', {
  lazy: false,
  server: false,
});

// Watch for existing config and populate form
watch(existingConfig, (config) => {
  if (config) {
    agentName.value = config.agent_name || '';
    selectedVoiceId.value = config.elevenlabs_voice_id;
    systemPrompt.value = config.system_prompt || '';
  }
}, { immediate: true });

// Clear field errors when values change
watch([agentName, selectedVoiceId, systemPrompt], () => {
  errors.agentName = '';
  errors.voiceId = '';
  errors.systemPrompt = '';
  error.value = null;
  showSuccess.value = false;
});

// Save handler
async function handleSaveAgent() {
  try {
    isLoading.value = true;
    error.value = null;
    showSuccess.value = false;

    // Reset field errors
    Object.keys(errors).forEach((key) => {
      errors[key as keyof typeof errors] = '';
    });

    // Validate form data
    const validatedData = formSchema.parse({
      agent_name: agentName.value,
      elevenlabs_voice_id: selectedVoiceId.value,
      system_prompt: systemPrompt.value,
    });

    // Submit to API
    const response = await $fetch<AiAgent>('/api/ai/agent', {
      method: 'PUT',
      body: validatedData,
    });

    if (response) {
      // Update local state with saved data
      existingConfig.value = response;
      showSuccess.value = true;

      // Hide success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
    }
  }
  catch (err: any) {
    console.error('Error saving agent configuration:', err);

    if (err instanceof z.ZodError) {
      // Map validation errors to form fields
      err.errors.forEach((error) => {
        const field = error.path[0];
        if (field === 'agent_name') {
          errors.agentName = error.message;
        }
        else if (field === 'elevenlabs_voice_id') {
          errors.voiceId = error.message;
        }
        else if (field === 'system_prompt') {
          errors.systemPrompt = error.message;
        }
      });
    }
    else {
      error.value = err.data?.message || t('ai.agent.saveError');
    }
  }
  finally {
    isLoading.value = false;
  }
}
</script>
