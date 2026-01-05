import { TakeoutHabits, ForecastResult } from '../types/models';

export const calculateForecast = (
  habits: TakeoutHabits,
  location: string
): ForecastResult => {
  // Calculate weekly frequency
  const weeklyFrequency = (() => {
    switch (habits.frequency) {
      case "Every day":
        return 7;
      case "4–6 times per week":
        return 5;
      case "2–3 times per week":
        return 2;
      case "Weekends only":
        return 2;
      case "Rarely":
        return 0;
      default:
        return 1;
    }
  })();

  // Calculate average spend
  const averageSpend = (() => {
    const range = habits.spendRange.replace(/[£$]/g, '');
    const values = range.split('–');
    if (values.length === 2) {
      return (parseFloat(values[0]) + parseFloat(values[1])) / 2;
    } else {
      return parseFloat(values[0].replace('+', ''));
    }
  })();

  // Calculate totals
  const weeklySpend = averageSpend * weeklyFrequency;
  const monthlySpend = weeklySpend * 4;
  const monthlyCalories = habits.calories * weeklyFrequency * 4;

  // Calculate projected weight loss (3 months)
  const totalCalories = monthlyCalories * 3;
  const weightLossKg = totalCalories / 7700;
  const weightLossLbs = weightLossKg * 2.2;

  return {
    weeklySpend,
    monthlySpend,
    monthlyCalories,
    projectedWeightLoss: weightLossLbs
  };
}; 