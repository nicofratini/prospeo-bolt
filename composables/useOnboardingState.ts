export interface OnboardingStep {
  path: string;
  title: string;
  canSkip?: boolean;
}

export function useOnboardingState() {
  // const { t } = useNuxtApp().$i18n;
  const router = useRouter();
  const route = useRoute();
  const localePath = useLocalePath();

  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      path: '/onboarding/welcome',
      title: 'onboarding.steps.welcome',
      canSkip: true,
    },
    {
      path: '/onboarding/property',
      title: 'onboarding.steps.property',
    },
    {
      path: '/onboarding/ai-agent',
      title: 'onboarding.steps.aiAgent',
    },
    {
      path: '/onboarding/features',
      title: 'onboarding.steps.features',
      canSkip: true,
    },
  ];

  // State
  const currentStepIndex = computed(() => steps.findIndex(step => step.path === route.path.substring(3)));
  const currentStep = computed(() => currentStepIndex.value + 1);
  const totalSteps = steps.length;
  const currentStepTitle = computed(() => steps[currentStepIndex.value]?.title || '');
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === steps.length - 1);
  const canProceed = ref(true);
  const isSkippable = computed(() => steps[currentStepIndex.value]?.canSkip || false);

  // Progress calculation
  const progress = computed(() => {
    const current = currentStepIndex.value + 1;
    const percentage = (current / totalSteps) * 100;
    return {
      current,
      total: totalSteps,
      percentage: Math.round(percentage),
    };
  });

  // Navigation methods
  function goBack() {
    if (!isFirstStep.value) {
      router.push(localePath(steps[currentStepIndex.value - 1].path));
    }
  }

  async function goNext() {
    console.log(currentStepIndex.value, route.path.substring(3));
    if (isLastStep.value) {
      try {
        // Mark onboarding as completed in database
        await $fetch('/api/users/onboarding/complete', {
          method: 'POST',
        });

        // Redirect to dashboard
        router.push(localePath('/dashboard'));
      }
      catch (error) {
        console.error('Error completing onboarding:', error);
        // Continue to dashboard even if the API call fails
        router.push(localePath('/dashboard'));
      }
    }
    else {
      router.push(localePath(steps[currentStepIndex.value + 1].path));
    }
  }

  function skipStep() {
    if (isSkippable.value && !isLastStep.value) {
      router.push(localePath(steps[currentStepIndex.value + 1].path));
    }
  }

  function setCanProceed(value: boolean) {
    canProceed.value = value;
  }

  // Fetch onboarding status from API
  const { data: onboardingStatus, refresh: refreshStatus } = useFetch('/api/users/onboarding/status');

  // Computed property for onboarding completion status
  const isOnboardingCompleted = computed(() => onboardingStatus.value?.completed || false);

  return {
    // State
    currentStep,
    totalSteps,
    currentStepTitle,
    isFirstStep,
    isLastStep,
    canProceed,
    isSkippable,
    progress,
    isOnboardingCompleted,

    // Methods
    goBack,
    goNext,
    skipStep,
    setCanProceed,
    refreshStatus,
  };
}
