import React, { createContext, useContext, useState } from "react";
import { BlockingPlan, CravingLogInput, LockMode } from "../types/models";

export interface BlockingSchedule {
  startTime: string;
  endTime: string;
  days: string[];
}

export interface OnboardingData {
  name: string;
  email: string;
  age: string;
  location: string;
  password: string;
  takeoutFrequency: string;
  spendRange: string;
  estimatedCalories: string | number;
  monthlyStats: {
    spend: number;
    calories: number;
  };
  blockingSchedule: BlockingSchedule;
  emotionalCheckIn: string;
  howDoYouFeel: string;
  cravingPatterns: {
    cravingTimes: string[];
    triggers: string[];
  };
  appPreferences: {
    selectedApps: string[];
  };
  blockingPlan: {
    lockMode: LockMode;
    cheatMealSlot: string;
    weekdaySchedule: { [key: string]: boolean };
    weekendSchedule: { [key: string]: boolean };
  };
  concerns: string;
  desiredControl: string;
  startDate: string;
  goals: string[];
  emotionalAnchor: string;
  healthyRelationship: string;
  cravingLog: CravingLogInput[];
}

export interface AppContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  createPersonalizedBlockingPlan: () => {
    lockMode: LockMode;
    cheatMealSlot: string;
    weekdaySchedule: { [key: string]: boolean };
    weekendSchedule: { [key: string]: boolean };
  };
  updateBlockingPlan: (plan: BlockingPlan) => void;
  resetApp: () => void;
  createThreeMonthsOutlook: (monthlyStats: {
    spend: number;
    calories: number;
  }) => {
    monthlyProjections: {
      month: number;
      moneySaved: number;
      caloriesReduced: number;
      weightLossLbs: number;
    }[];
    totals: {
      totalMoneySaved: number;
      totalCaloriesReduced: number;
      totalWeightLossLbs: number;
    };
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: "",
    email: "",
    password: "",
    age: "",
    location: "",
    takeoutFrequency: "2-3 times per week",
    spendRange: "20",
    estimatedCalories: "1300",
    monthlyStats: {
      spend: 0,
      calories: 0,
    },
    blockingSchedule: {
      startTime: "22:00",
      endTime: "07:00",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    cravingPatterns: {
      cravingTimes: [],
      triggers: [],
    },
    appPreferences: {
      selectedApps: [],
    },
    blockingPlan: {
      lockMode: LockMode.Gentle,
      cheatMealSlot: "Friday Evening",
      weekdaySchedule: {},
      weekendSchedule: {},
    },
    emotionalCheckIn: "",
    howDoYouFeel: "",
    concerns: "weight_gain",
    desiredControl: "full",
    startDate: new Date().toISOString(),
    goals: [],
    emotionalAnchor: "",
    healthyRelationship: "",
    cravingLog: [],
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const resetApp = () => {
    setOnboardingData({
      name: "",
      email: "",
      password: "",
      age: "",
      location: "",
      takeoutFrequency: "",
      spendRange: "",
      estimatedCalories: "",
      monthlyStats: {
        spend: 0,
        calories: 0,
      },
      blockingSchedule: {
        startTime: "",
        endTime: "",
        days: [],
      },
      cravingPatterns: {
        cravingTimes: [],
        triggers: [],
      },
      appPreferences: {
        selectedApps: [],
      },
      blockingPlan: {
        lockMode: LockMode.Gentle,
        cheatMealSlot: "",
        weekdaySchedule: {},
        weekendSchedule: {},
      },
      emotionalCheckIn: "",
      howDoYouFeel: "",
      concerns: "weight_gain",
      desiredControl: "full",
      startDate: new Date().toISOString(),
      goals: [],
      emotionalAnchor: "",
      healthyRelationship: "",
      cravingLog: [],
    });
  };

  const createPersonalizedBlockingPlan = () => {
    const {
      appPreferences,
      takeoutFrequency,
      spendRange,
      estimatedCalories,
      goals,
      cravingPatterns,
      concerns,
      desiredControl: userDesiredControl,
      healthyRelationship,
    } = onboardingData;

    // Calculate behavior intensity (current behavior)
    const calculateBehaviorIntensity = () => {
      let intensity = 0;

      // Frequency factor (0-5)
      const frequencyMap: { [key: string]: number } = {
        "1-2 times a week": 1,
        "2-3 times a week": 2,
        "3-4 times a week": 3,
        "4-5 times a week": 4,
        "5+ times a week": 5,
      };
      intensity += frequencyMap[takeoutFrequency] || 0;

      // Spending factor (0-3)
      const spendAmount = parseFloat(spendRange);
      if (spendAmount > 40) intensity += 3;
      else if (spendAmount > 25) intensity += 2;
      else if (spendAmount > 15) intensity += 1;

      // Craving patterns factor (0-4)
      intensity +=
        cravingPatterns.cravingTimes.length + cravingPatterns.triggers.length;

      return Math.min(intensity / 12, 1); // Normalize to 0-1
    };

    // Calculate desired control level (desired outcome)
    const calculateDesiredControlLevel = () => {
      let controlLevel = 0;

      // Desired relationship factor (0-4)
      const relationshipMap: { [key: string]: number } = {
        stop: 4,
        planned: 3,
        once_week: 3,
        special_occasions: 2,
        budget: 2,
        mindful: 1,
      };
      controlLevel += relationshipMap[healthyRelationship] || 0;

      // Goals factor (0-3)
      if (goals.includes("weight_loss")) controlLevel += 1;
      if (goals.includes("save_money")) controlLevel += 1;
      if (goals.includes("control")) controlLevel += 1;

      // Desired control factor (0-3)
      controlLevel += userDesiredControl === "full" ? 3 : 1;

      return Math.min(controlLevel / 10, 1); // Normalize to 0-1
    };

    // Calculate blocking intensity based on formula
    const behaviorIntensity = calculateBehaviorIntensity();
    const desiredControlLevel = calculateDesiredControlLevel();
    const blockingIntensity = behaviorIntensity * desiredControlLevel;

    // Determine lock mode based on blocking intensity
    let lockMode: LockMode;
    if (blockingIntensity > 0.75) {
      lockMode = LockMode.Strict;
    } else if (blockingIntensity > 0.5) {
      lockMode = LockMode.Balanced;
    } else if (blockingIntensity > 0.25) {
      lockMode = LockMode.Gentle;
    } else {
      lockMode = LockMode.Gentle;
    }

    // Initialize schedules with updated time slots
    const defaultSchedule = {
      "6:00 PM-9:00 AM": false, // Evening through morning
      "12:00 PM-9:00 AM": false, // Weekend extended block
      "6:00 PM-3:00 AM": false, // After drinking window
      "4:00 PM-10:00 PM": false, // Fallback window
      "6:00 AM-9:00 AM": false, // Weekend morning protection
    };

    const weekdaySchedule = { ...defaultSchedule };
    const weekendSchedule = { ...defaultSchedule };

    // Set blocking windows based on behavior intensity and patterns
    if (
      cravingPatterns.cravingTimes.includes("evening") ||
      cravingPatterns.cravingTimes.includes("late_night") ||
      cravingPatterns.triggers.includes("after_work")
    ) {
      weekdaySchedule["6:00 PM-9:00 AM"] = true;
      // Add additional protection for high intensity
      if (blockingIntensity > 0.7) {
        weekdaySchedule["4:00 PM-10:00 PM"] = true;
      }
    }

    if (cravingPatterns.triggers.includes("weekends")) {
      weekendSchedule["12:00 PM-9:00 AM"] = true;
      // Add morning protection for high intensity
      if (blockingIntensity > 0.6) {
        weekendSchedule["6:00 AM-9:00 AM"] = true;
      }
    }

    if (cravingPatterns.triggers.includes("after_drinking")) {
      weekdaySchedule["6:00 PM-3:00 AM"] = true;
      weekendSchedule["6:00 PM-3:00 AM"] = true;
    }

    // Fallback for "Other" or no specific patterns
    if (
      (!cravingPatterns.cravingTimes.length &&
        !cravingPatterns.triggers.length) ||
      cravingPatterns.cravingTimes.includes("other")
    ) {
      // Adjust fallback window based on blocking intensity
      weekdaySchedule["4:00 PM-10:00 PM"] = true;
      if (blockingIntensity > 0.5) {
        weekendSchedule["6:00 AM-9:00 AM"] = true;
      }
    }

    // Determine cheat meal frequency and timing based on blocking intensity
    let cheatMealDay = "Saturday";
    let cheatMealWindow = "11:00 AM-2:00 PM";
    let cheatMealFrequency = "weekly";

    if (blockingIntensity > 0.8) {
      cheatMealFrequency = "bi-weekly"; // Reduce frequency for high intensity
      cheatMealWindow = "11:00 AM-1:00 PM"; // Shorter window
    } else if (blockingIntensity > 0.6) {
      cheatMealWindow = "11:00 AM-2:00 PM"; // Standard window
    } else {
      cheatMealWindow = "11:00 AM-3:00 PM"; // Longer window for lower intensity
    }

    // Move to weekday if weekend triggers are strong
    if (
      cravingPatterns.triggers.includes("weekends") ||
      cravingPatterns.triggers.includes("after_drinking")
    ) {
      cheatMealDay = "Wednesday";
    }

    return {
      lockMode,
      cheatMealSlot: `${cheatMealDay}, ${cheatMealWindow}`,
      cheatMealFrequency,
      weekdaySchedule,
      weekendSchedule,
      blockingIntensity, // Adding this for potential UI feedback
    };
  };

  const updateBlockingPlan = (plan: BlockingPlan) => {};

  const createThreeMonthsOutlook = (monthlyStats: {
    spend: number;
    calories: number;
  }) => {
    // Calculate monthly projections with adaptation factor
    const monthlyProjections = Array.from({ length: 3 }, (_, month) => {
      const monthNumber = month + 1;
      const adaptationFactor = 1 - monthNumber * 0.1; // Users adapt better over time

      // Use the monthly stats directly
      const moneySaved = monthlyStats.spend * adaptationFactor;
      const caloriesReduced = monthlyStats.calories * adaptationFactor;

      // Weight loss calculations (using 3500 calories = 1 pound rule)
      const potentialWeightLoss = caloriesReduced / 3500;

      return {
        month: monthNumber,
        moneySaved: Math.round(moneySaved * 100) / 100,
        caloriesReduced: Math.round(caloriesReduced),
        weightLossLbs: Math.round(potentialWeightLoss * 10) / 10,
      };
    });

    return {
      monthlyProjections,
      totals: {
        totalMoneySaved:
          Math.round(
            monthlyProjections.reduce((sum, m) => sum + m.moneySaved, 0) * 100
          ) / 100,
        totalCaloriesReduced: Math.round(
          monthlyProjections.reduce((sum, m) => sum + m.caloriesReduced, 0)
        ),
        totalWeightLossLbs:
          Math.round(
            monthlyProjections.reduce((sum, m) => sum + m.weightLossLbs, 0) * 10
          ) / 10,
      },
    };
  };

  return (
    <AppContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        resetApp,
        createPersonalizedBlockingPlan,
        updateBlockingPlan,
        createThreeMonthsOutlook,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
