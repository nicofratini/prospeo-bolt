<template>
  <header
    class="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60"
    :class="{ 'border-b': !isScrolled }"
  >
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Brand -->
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center space-x-2"
        >
          <Icon
            name="heroicons:cube-transparent"
            class="h-8 w-8 text-primary-600 dark:text-primary-400"
          />
          <span class="text-xl font-bold text-gray-900 dark:text-white">
            {{ $t('common.appName') }}
          </span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex lg:items-center lg:space-x-6">
          <!-- Language Switcher -->
          <UiSelect
            v-model="locale"
            :options="[
              { value: 'en', label: t('common.english') },
              { value: 'fr', label: t('common.french') },
            ]"
            class="w-32"
          />

          <!-- Theme Toggle -->
          <UiButton
            variant="ghost"
            size="icon"
            :icon="isDarkMode ? 'heroicons:sun' : 'heroicons:moon'"
            :aria-label="isDarkMode ? t('common.lightMode') : t('common.darkMode')"
            @click="toggleTheme"
          />

          <!-- Navigation Links -->
          <NuxtLink
            :to="localePath('/')"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {{ t('home.title') }}
          </NuxtLink>

          <!-- Auth Status -->
          <template v-if="status === 'authenticated' && user">
            <div class="relative">
              <UiButton
                ref="userMenuTrigger"
                variant="ghost"
                class="flex items-center space-x-2"
                @click="isUserMenuOpen = !isUserMenuOpen"
              >
                <span class="text-sm">{{ user.name || user.email }}</span>
                <Icon
                  name="heroicons:chevron-down"
                  class="h-4 w-4"
                  :class="{ 'rotate-180': isUserMenuOpen }"
                />
              </UiButton>

              <div
                v-if="isUserMenuOpen"
                v-click-outside="closeUserMenu"
                class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div class="py-1">
                  <NuxtLink
                    :to="localePath('/account')"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="isUserMenuOpen = false"
                  >
                    {{ t('account.title') }}
                  </NuxtLink>
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="handleLogout"
                  >
                    {{ t('auth.logout') }}
                  </button>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink
              :to="localePath('/auth/login')"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {{ t('auth.login') }}
            </NuxtLink>
            <UiButton
              :to="localePath('/auth/register')"
              variant="primary"
            >
              {{ t('auth.register') }}
            </UiButton>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <UiButton
          class="lg:hidden"
          variant="ghost"
          size="icon"
          :icon="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'"
          @click="$emit('toggleMobileMenu')"
        />
      </div>

      <!-- Mobile Navigation -->
      <div
        v-show="isMobileMenuOpen"
        class="lg:hidden"
      >
        <div class="mt-4 space-y-4 pb-3 pt-2">
          <NuxtLink
            :to="localePath('/')"
            class="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            @click="$emit('toggleMobileMenu', false)"
          >
            {{ t('home.title') }}
          </NuxtLink>

          <template v-if="status === 'authenticated' && user">
            <NuxtLink
              :to="localePath('/account')"
              class="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              @click="$emit('toggleMobileMenu', false)"
            >
              {{ t('account.title') }}
            </NuxtLink>
            <button
              class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              @click="handleLogout"
            >
              {{ t('auth.logout') }}
            </button>
          </template>
          <template v-else>
            <NuxtLink
              :to="localePath('/auth/login')"
              class="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              @click="$emit('toggleMobileMenu', false)"
            >
              {{ t('auth.login') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/auth/register')"
              class="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              @click="$emit('toggleMobileMenu', false)"
            >
              {{ t('auth.register') }}
            </NuxtLink>
          </template>

          <div class="flex items-center justify-between pt-4">
            <UiSelect
              v-model="locale"
              :options="[
                { value: 'en', label: t('common.english') },
                { value: 'fr', label: t('common.french') },
              ]"
              class="w-32"
            />
            <UiButton
              variant="ghost"
              size="icon"
              :icon="isDarkMode ? 'heroicons:sun' : 'heroicons:moon'"
              :aria-label="isDarkMode ? t('common.lightMode') : t('common.darkMode')"
              @click="toggleTheme"
            />
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '~/stores/theme';
import { onClickOutside } from '@vueuse/core';

interface Props {
  isMobileMenuOpen: boolean
}

defineProps<Props>();
defineEmits(['toggleMobileMenu']);

const { t, locale } = useI18n();
const { status, data: { user }, signOut } = useAuth();
const router = useRouter();
const localePath = useLocalePath();
const themeStore = useThemeStore();

// State
const isUserMenuOpen = ref(false);
const isScrolled = ref(false);
const userMenuTrigger = ref<HTMLElement | null>(null);

// Computed
const isDarkMode = computed(() => themeStore.isDarkMode);

// Methods
const toggleTheme = () => {
  themeStore.toggleTheme();
};

// Use onClickOutside from @vueuse/core instead of v-click-outside directive
onClickOutside(userMenuTrigger, () => {
  isUserMenuOpen.value = false;
});

const handleLogout = async () => {
  try {
    await signOut({
      callbackUrl: localePath('/auth/login'),
    });
    isUserMenuOpen.value = false;
  }
  catch (error) {
    console.error('Logout failed:', error);
  }
};

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check initial scroll position
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>