<template>
  <div>
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mb-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        {{ t("auth.login") }}
      </h2>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="login"
    >
      <!-- Server-side rendered error message -->
      <div
        v-if="errors.general"
        class="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md"
      >
        {{ errors.general }}
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
            :placeholder="t('auth.emailPlaceholder')"
            required
            autocomplete="email"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': errors.email }"
          >
          <p
            v-if="errors.email"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.email }}
          </p>
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
            :placeholder="t('auth.passwordPlaceholder')"
            required
            autocomplete="current-password"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            :class="{ 'border-red-500': errors.password }"
          >
          <p
            v-if="errors.password"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.password }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          >
          <label
            for="remember-me"
            class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            {{ t("auth.rememberMe") }}
          </label>
        </div>

        <div class="text-sm">
          <NuxtLink
            to="/auth/forgot-password"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            {{ t("auth.forgotPassword") }}
          </NuxtLink>
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {{ t("auth.login") }}
        </button>
      </div>

      <div class="text-sm text-center">
        <NuxtLink
          :to="localePath('/auth/register')"
          class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          {{ t("auth.dontHaveAccount") }}
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
const localePath = useLocalePath();

// Form state with SSR-safe initial values
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const errors = reactive({
  email: '',
  password: '',
  general: '',
});

// Form validation schema
const schema = z.object({
  email: z.string().email(t('auth.invalidEmail')),
  password: z.string().min(8, t('auth.passwordTooShort')),
});

// Clear errors when input changes
watch([email, password], () => {
  errors.email = '';
  errors.password = '';
  errors.general = '';
});

async function login() {
  try {
    isLoading.value = true;
    errors.general = '';

    // Validate form
    const validatedData = schema.parse({
      email: email.value,
      password: password.value,
    });

    // Sign in
    const { error: signInError } = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      remember: rememberMe.value,
      redirect: false,
    });

    if (signInError) {
      errors.general = t('auth.invalidCredentials');
      return;
    }

    // Redirect to home page on success
    router.push(localePath('/'));
  }
  catch (err) {
    if (err instanceof z.ZodError) {
      // Map validation errors to form fields
      err.errors.forEach((error) => {
        if (error.path[0] === 'email') {
          errors.email = error.message;
        }
        else if (error.path[0] === 'password') {
          errors.password = error.message;
        }
      });
    }
    else {
      errors.general = err.message || t('common.error');
    }
  }
  finally {
    isLoading.value = false;
  }
}
</script>