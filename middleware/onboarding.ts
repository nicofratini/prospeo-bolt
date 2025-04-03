import { useOnboardingState } from '~/composables/useOnboardingState';

export default defineNuxtRouteMiddleware((to) => {
  const { isOnboardingCompleted } = useOnboardingState();

  // Skip onboarding check for auth pages and the onboarding pages themselves
  if (to.path.startsWith('/auth') || to.path.indexOf('onboarding') !== -1) {
    return;
  }

  // If onboarding is not completed and user tries to access other pages,
  // redirect to onboarding
  if (!isOnboardingCompleted.value) {
    return navigateTo('/onboarding');
  }
});
