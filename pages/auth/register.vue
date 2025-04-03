<template>
  <div>
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mb-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        {{ t("auth.register") }}
      </h2>
    </div>
    <form
      class="space-y-4"
      @submit.prevent="register"
    >
      <div
        v-if="error"
        class="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md"
      >
        {{ error }}
      </div>

      <div>
        <label
          for="name"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ t("auth.name") }}
        </label>
        <div class="mt-1">
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>

      <div>
        <label
          for="email"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ t("auth.email") }}
        </label>
        <div class="mt-1">
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>

      <div>
        <label
          for="password"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ t("auth.password") }}
        </label>
        <div class="mt-1">
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>

      <div>
        <label
          for="confirmPassword"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ t("auth.confirmPassword") }}
        </label>
        <div class="mt-1">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="isLoading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ t("auth.register") }}
        </button>
      </div>

      <div class="text-sm text-center">
        <NuxtLink
          to="/auth/login"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          {{ t("auth.alreadyHaveAccount") }}
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' },
  layout: 'auth',
});

const { t } = useI18n();
const { signIn } = useAuth();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isLoading = ref(false);

const schema = z
  .object({
    name: z.string().min(2, t('auth.nameTooShort')),
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(8, t('auth.passwordTooShort')),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: t('auth.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

async function register() {
  try {
    isLoading.value = true;
    error.value = '';

    // Validate form
    schema.parse({
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });

    // Register user
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
      },
    });

    // Sign in
    const { error: signInError } = await signIn('credentials', {
      email: email.value,
      password: password.value,
      redirect: false,
    });

    if (signInError) {
      error.value = t('auth.loginAfterRegisterFailed');
      return;
    }

    // Redirect to agents page
    router.push('/');
  }
  catch (err) {
    if (err instanceof z.ZodError) {
      error.value = err.errors[0].message;
    }
    else if (err.response?.status === 409) {
      error.value = t('auth.emailAlreadyInUse');
    }
    else {
      error.value = err.message || t('common.error');
    }
  }
  finally {
    isLoading.value = false;
  }
}
</script>
