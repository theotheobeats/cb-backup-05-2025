import { useApp } from "@/context/AppContext";

interface Metrics {
  moneySaved: number;
  caloriesAvoided: number;
  cravingsBlocked: number;
  currentStreak: number;
}

interface CravingLog {
  timestamp: Date;
  isSuccess: boolean;
  appBlocked: string;
  spendingAvoided: number;
  caloriesAvoided: number;
}

export const useMetrics = () => {
  const { onboardingData } = useApp();

  const isWithinBlockingPeriod = (date: Date = new Date()): boolean => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Get the current schedule based on day
    const schedule = isWeekend
      ? onboardingData?.blockingPlan?.weekendSchedule
      : onboardingData?.blockingPlan?.weekdaySchedule;

    if (!schedule) return false;

    // Get the first time window
    const currentWindow = Object.keys(schedule)[0];
    if (!currentWindow) return false;

    // Parse the window times (format: "HH:mm-HH:mm")
    const [startTime, endTime] = currentWindow.split("-").map(time => time.trim());
    const [startHour, startMinute] = startTime.split(":").map(num => parseInt(num) || 0);
    const [endHour, endMinute] = endTime.split(":").map(num => parseInt(num) || 0);

    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  const calculateMoneySaved = (logs: CravingLog[]): number => {
    // If no logs, return 0 as we only count actual savings
    if (!logs || logs.length === 0) return 0;

    // Only count logs during blocking periods
    return Math.round(logs
      .filter(log => log.isSuccess && isWithinBlockingPeriod(new Date(log.timestamp)))
      .reduce((total, log) => total + (log.spendingAvoided || 0), 0));
  };

  const calculateCaloriesAvoided = (logs: CravingLog[]): number => {
    // If no logs, return 0 as we only count actual calories avoided
    if (!logs || logs.length === 0) return 0;

    // Only count logs during blocking periods
    return Math.round(logs
      .filter(log => log.isSuccess && isWithinBlockingPeriod(new Date(log.timestamp)))
      .reduce((total, log) => total + (log.caloriesAvoided || 0), 0));
  };

  const calculateCravingsBlocked = (logs: CravingLog[]): number => {
    // If no logs, return 0 as we only count actual blocks
    if (!logs || logs.length === 0) return 0;

    // Only count logs during blocking periods
    return logs.filter(log => 
      log.isSuccess && isWithinBlockingPeriod(new Date(log.timestamp))
    ).length;
  };

  const calculateCurrentStreak = (logs: CravingLog[]): number => {
    if (!logs || logs.length === 0) return 0;

    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get today's date without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's any failure today during blocking period
    const hasTodayFailure = sortedLogs.some(log => 
      !log.isSuccess && 
      isWithinBlockingPeriod(new Date(log.timestamp)) &&
      new Date(log.timestamp).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (hasTodayFailure) return 0;

    // Calculate streak
    let currentDate = today;
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].timestamp);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        if (!sortedLogs[i].isSuccess && isWithinBlockingPeriod(new Date(sortedLogs[i].timestamp))) break;
        if (i === sortedLogs.length - 1 || 
            new Date(sortedLogs[i + 1].timestamp).setHours(0, 0, 0, 0) !== currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      } else break;
    }

    return streak;
  };

  const getMetrics = (logs: CravingLog[] = []): Metrics => {
    return {
      moneySaved: calculateMoneySaved(logs),
      caloriesAvoided: calculateCaloriesAvoided(logs),
      cravingsBlocked: calculateCravingsBlocked(logs),
      currentStreak: calculateCurrentStreak(logs),
    };
  };

  return {
    getMetrics,
    calculateMoneySaved,
    calculateCaloriesAvoided,
    calculateCravingsBlocked,
    calculateCurrentStreak,
  };
}; 