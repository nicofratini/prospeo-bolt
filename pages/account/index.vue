<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
const { refresh, signOut } = useAuth();

const user = ref({
  id: '',
  name: '',
  email: '',
});

const form = ref({
  name: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const isLoading = ref(false);
const error = ref('');
const success = ref('');
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);

// Fetch user data
async function fetchUser() {
  try {
    const userData = await $fetch('/api/users');
    user.value = userData;
    form.value.name = userData.name;
  }
  catch (err: any) {
    error.value = err.message || t('common.error');
  }
}

onMounted(fetchUser);

// Update profile
async function updateProfile() {
  try {
    isLoading.value = true;
    error.value = '';
    success.value = '';

    const updateData: any = {};

    // Update name if changed
    if (form.value.name && form.value.name !== user.value.name) {
      updateData.name = form.value.name;
    }

    // Update password if provided
    if (form.value.newPassword) {
      // Validate password fields
      const schema = z.object({
        currentPassword: z.string().min(1, t('account.currentPasswordRequired')),
        newPassword: z.string().min(8, t('auth.passwordTooShort')),
        confirmPassword: z.string(),
      }).refine(data => data.newPassword === data.confirmPassword, {
        message: t('auth.passwordsDoNotMatch'),
        path: ['confirmPassword'],
      });

      schema.parse({
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
        confirmPassword: form.value.confirmPassword,
      });

      updateData.password = form.value.newPassword;
    }

    // Skip if no changes
    if (Object.keys(updateData).length === 0) {
      success.value = t('account.noChanges');
      return;
    }

    // Update user
    const updatedUser = await $fetch('/api/users', {
      method: 'PUT',
      body: updateData,
    });

    // Update local user data
    user.value = updatedUser;

    // Clear password fields
    form.value.currentPassword = '';
    form.value.newPassword = '';
    form.value.confirmPassword = '';

    if (updateData.name) {
      await refresh();
    }

    success.value = t('account.accountUpdated');
  }
  catch (err: any) {
    if (err instanceof z.ZodError) {
      error.value = err.errors[0].message;
    }
    else {
      error.value = err.message || t('common.error');
    }
  }
  finally {
    isLoading.value = false;
  }
}

// Delete account
async function deleteAccount() {
  try {
    isDeleting.value = true;
    error.value = '';

    await $fetch('/api/users', {
      method: 'DELETE',
    });

    // Sign out and redirect to home
    await signOut({
      callbackUrl: '/',
    });
  }
  catch (err: any) {
    error.value = err.message || t('common.error');
    isDeleting.value = false;
    showDeleteConfirm.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('account.title') }}
    </h1>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ t('account.profile') }}
        </h2>

        <div
          v-if="error"
          class="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md"
        >
          {{ error }}
        </div>

        <div
          v-if="success"
          class="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md"
        >
          {{ success }}
        </div>

        <form
          class="space-y-6"
          @submit.prevent="updateProfile"
        >
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ t('auth.email') }}
            </label>
            <div class="mt-1">
              <input
                id="email"
                type="email"
                :value="user.email"
                disabled
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
            </div>
          </div>

          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ t('auth.name') }}
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {{ t('account.changePassword') }}
            </h3>

            <div>
              <label
                for="currentPassword"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('account.currentPassword') }}
              </label>
              <div class="mt-1">
                <input
                  id="currentPassword"
                  v-model="form.currentPassword"
                  type="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>

            <div class="mt-4">
              <label
                for="newPassword"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('account.newPassword') }}
              </label>
              <div class="mt-1">
                <input
                  id="newPassword"
                  v-model="form.newPassword"
                  type="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>

            <div class="mt-4">
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('auth.confirmPassword') }}
              </label>
              <div class="mt-1">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {{ t('common.save') }}
            </button>
          </div>
        </form>

        <div class="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            {{ t('account.deleteAccount') }}
          </h3>

          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {{ t('account.confirmDelete') }}
          </p>

          <div v-if="!showDeleteConfirm">
            <button
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="showDeleteConfirm = true"
            >
              {{ t('account.deleteAccount') }}
            </button>
          </div>

          <div
            v-else
            class="flex space-x-4"
          >
            <button
              :disabled="isDeleting"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="deleteAccount"
            >
              <svg
                v-if="isDeleting"
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
              {{ t('common.confirm') }}
            </button>

            <button
              :disabled="isDeleting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="showDeleteConfirm = false"
            >
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
