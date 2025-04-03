<template>
  <div 
    class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    :class="{ 'overflow-hidden max-h-screen': isMobileMenuOpen }"
  >
    <!-- Skip to main content link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white dark:bg-gray-800 p-4 rounded-md shadow-md z-50"
    >
      {{ $t('common.skipToContent') }}
    </a>

    <AppHeader
      :is-mobile-menu-open="isMobileMenuOpen"
      @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen"
    />

    <main
      id="main-content"
      class="flex-grow container mx-auto px-4 py-8"
    >
      <!-- Page loading indicator -->
      <div
        v-if="isPageLoading"
        class="flex justify-center items-center py-12"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
      </div>

      <!-- Page transition wrapper -->
      <div
        v-else
        class="transition-opacity duration-200"
        :class="{ 'opacity-0': isPageTransitioning }"
      >
        <slot />
      </div>
    </main>

    <AppFooter />

    <!-- Mobile menu overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWindowScroll } from '@vueuse/core';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();

// State
const isMobileMenuOpen = ref(false);
const isPageLoading = ref(false);
const isPageTransitioning = ref(false);
const { y: scrollY } = useWindowScroll();

// Close mobile menu on route change
watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
    isPageTransitioning.value = true;
    setTimeout(() => {
      isPageTransitioning.value = false;
    }, 200);
  },
);

// Prevent body scroll when mobile menu is open
watch(isMobileMenuOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
});

// Page transition handling
onBeforeRouteLeave(() => {
  isPageTransitioning.value = true;
});

onBeforeRouteUpdate(() => {
  isPageLoading.value = true;
});

onMounted(() => {
  isPageLoading.value = false;
});

// Cleanup
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>