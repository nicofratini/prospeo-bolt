import { defineNuxtRouteMiddleware, navigateTo, useAuth } from '#imports';
import { useOnboardingState } from '~/composables/useOnboardingState';

export default defineNuxtRouteMiddleware(async (to) => {
  const { status } = useAuth();

  // Skip if not logged in or still loading auth state
  if (status.value !== 'authenticated') {
    return;
  }

  // Skip if already in onboarding or auth routes
  if (to.path.indexOf('onboarding') !== -1 || to.path.startsWith('/auth')) {
    return;
  }

  // Get onboarding status from composable
  const { isOnboardingCompleted } = useOnboardingState();

  // If onboarding is not completed, redirect to onboarding
  if (!isOnboardingCompleted.value) {
    return navigateTo('/onboarding/welcome');
  }
});
