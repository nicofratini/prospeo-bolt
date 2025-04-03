<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
        {{ t('onboarding.aiAgent.title') }}
      </h3>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ t('onboarding.aiAgent.description') }}
      </p>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Agent Name -->
      <UiInput
        v-model="form.agent_name"
        :label="t('ai.agent.name')"
        :placeholder="t('ai.agent.namePlaceholder')"
        :error="errors.agent_name"
        required
      />

      <!-- Voice Selection -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('ai.agent.voice') }}
        </label>
        <AiVoiceSelector v-model="form.elevenlabs_voice_id" />
        <p
          v-if="errors.elevenlabs_voice_id"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.elevenlabs_voice_id }}
        </p>
      </div>

      <!-- System Prompt -->
      <div>
        <label
          for="system_prompt"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {{ t('ai.agent.systemPrompt') }}
        </label>
        <textarea
          id="system_prompt"
          v-model="form.system_prompt"
          rows="6"
          :placeholder="t('ai.agent.systemPromptPlaceholder')"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
        />
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ t('ai.agent.systemPromptHelp') }}
        </p>
        <p
          v-if="errors.system_prompt"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.system_prompt }}
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';
import AiVoiceSelector from '~/components/ai/AiVoiceSelector.vue';

definePageMeta({
  layout: 'onboarding',
  middleware: ['sidebase-auth'],
});

const { t } = useI18n();
const { setCanProceed, goNext } = inject('onboardingNavigation') as {
  setCanProceed: (value: boolean) => void;
  goNext: () => void;
};

// Form state
const form = ref({
  agent_name: '',
  elevenlabs_voice_id: '',
  system_prompt: '',
});

const errors = ref({
  agent_name: '',
  elevenlabs_voice_id: '',
  system_prompt: '',
});

// Validation schema
const schema = z.object({
  agent_name: z.string().min(1, t('ai.agent.errors.nameRequired')),
  elevenlabs_voice_id: z.string().min(1, t('ai.agent.errors.voiceRequired')),
  system_prompt: z.string().optional(),
});

// Watch form for validation
watch(form, () => {
  try {
    schema.parse(form.value);
    setCanProceed(true);
  }
  catch (err) {
    setCanProceed(false);
  }
}, { deep: true });

// Submit handler
async function handleSubmit() {
  try {
    const validatedData = schema.parse(form.value);

    // Create AI agent
    await $fetch('/api/ai/agent', {
      method: 'PUT',
      body: validatedData,
    });

    // Continue to next step
    goNext();
  }
  catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach((error) => {
        if (error.path[0] && error.path[0] in errors.value) {
          errors.value[error.path[0] as keyof typeof errors.value] = error.message;
        }
      });
    }
    else {
      console.error('Error creating AI agent:', err);
    }
  }
}
</script>
