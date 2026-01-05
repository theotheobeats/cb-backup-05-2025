export enum LockMode {
  Gentle = "Gentle",
  Balanced = "Balanced",
  Strict = "Strict",
  CompleteLockdown = "CompleteLockdown",
}

export interface TakeoutHabits {
  frequency: string;
  spendRange: string;
  calories: number;
}

export interface CravingPatterns {
  cravingTimes: string[];
  triggers: string[];
}

export interface AppPreferences {
  selectedApps: string[];
  mostUsedApp: string;
}

export interface BlockingPlan {
  weekdaySchedule: {
    start: string;
    end: string;
  };
  weekendSchedule: {
    start: string;
    end: string;
  };
  cheatMealWindow: {
    day: string;
    start: string;
    end: string;
  };
  frequency: string;
}

export interface OnboardingData {
  // User Profile
  email: string;
  password: string;
  name: string;
  age: string;
  location: string;
  takeoutFrequency: string;
  spendRange: string;
  estimatedCalories: string | number;
  emotionalCheckIn: string;
  howDoYouFeel: string;
  concerns: string;
  desiredControl: string;
  startDate: string;
  goals: string[];
  emotionalAnchor: string;
  healthyRelationship: string;

  // Craving Patterns
  cravingPatterns: CravingPatterns;

  // App Preferences
  appPreferences: {
    selectedApps: string[];
  };

  // Blocking Plan
  blockingPlan: {
    lockMode: string;
    cheatMealSlot: string;
    weekdaySchedule: Record<string, boolean>;
    weekendSchedule: Record<string, boolean>;
  };
}

export interface ForecastResult {
  weeklySpend: number;
  monthlySpend: number;
  monthlyCalories: number;
  projectedWeightLoss: number;
}

export interface EmotionalState {
  currentMood: string;
  lastCheckIn: Date;
  notes: string;
}

export type CravingIntensity = 1 | 2 | 3;

export interface CravingLog {
  id: string;
  timestamp: string;
  isSuccess: boolean;
  emotion?: string;
  intensity?: CravingIntensity;
  trigger?: string;
  blockedApp: string;
  timeOfDay: string;
  notes?: string;
  spendingAvoided: number;
  caloriesAvoided: number;
}

export interface CravingLogInput {
  id?: string;
  isSuccess: boolean;
  emotion?: string;
  intensity?: CravingIntensity;
  trigger?: string;
  blockedApp: string;
  notes?: string;
  timestamp?: string;
  timeOfDay?: string;
  spendingAvoided?: number;
  caloriesAvoided?: number;
}
