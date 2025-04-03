<template>
  <div :class="{ 'dark': isDarkMode }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);
const { status } = useAuth();

// Initialize theme on app mount
onMounted(() => {
  themeStore.initTheme();
});

// Watch auth status for any global auth-related side effects
watch(() => status.value, (newStatus) => {
  if (newStatus === 'unauthenticated') {
    // Handle unauthenticated state globally if needed
    console.log('User is not authenticated');
  }
});
</script>