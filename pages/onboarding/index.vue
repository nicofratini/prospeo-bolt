<template>
  <div>
    <!-- This page will redirect to the first step -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'onboarding',
  middleware: ['sidebase-auth'],
});

const router = useRouter();
const localePath = useLocalePath();

// Redirect to the first step
onMounted(() => {
  router.replace(localePath('/onboarding/welcome'));
});
</script>
