import { useRoute } from '@react-navigation/native';

const ONBOARDING_PROGRESS: { [key: string]: number } = {
  OnboardingWelcome: 0,
  BasicInfo: 10,
  TakeoutHabits: 15,
  EmotionalCheckIn: 20,
  HowDoYouFeel: 25,
  Goals: 30,
  EmotionalAnchor: 35,
  HealthyRelationship: 40,
  Concern: 50,
  Motivation: 60,
  AppSelection: 70,
  CravingPattern: 75,
  BlockingPlan: 80,
  ThreeMonthsOutlook: 85,
  PaymentScreen: 90
};

export const useOnboardingProgress = () => {
  const route = useRoute();
  return ONBOARDING_PROGRESS[route.name] || 0;
};

export default useOnboardingProgress; 