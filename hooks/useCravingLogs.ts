import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CravingLog, CravingLogInput } from '@/types/models';
import { useApp } from '@/context/AppContext';

const STORAGE_KEY = '@craving_logs';

export const useCravingLogs = () => {
  const [logs, setLogs] = useState<CravingLog[]>([]);
  const { onboardingData } = useApp();

  // Load logs from storage on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const saveLogs = async (updatedLogs: CravingLog[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
      setLogs(updatedLogs);
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  };

  const calculateSpendingAndCalories = (isSuccess: boolean) => {
    if (!isSuccess) return { spendingAvoided: 0, caloriesAvoided: 0 };

    // Get average spending from spend range
    const spendRange = onboardingData?.spendRange || "15-25";
    const [min, max] = spendRange.split("-").map(num => parseInt(num.trim()) || 0);
    const avgSpend = (min + max) / 2;

    // Get calories from onboarding data
    const calories = typeof onboardingData?.estimatedCalories === 'number' 
      ? onboardingData.estimatedCalories 
      : 800;

    return {
      spendingAvoided: avgSpend,
      caloriesAvoided: calories,
    };
  };

  const addLog = async (input: CravingLogInput) => {
    const { spendingAvoided, caloriesAvoided } = calculateSpendingAndCalories(input.isSuccess);
    
    const newLog: CravingLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      timeOfDay: new Date().toLocaleTimeString(),
      spendingAvoided,
      caloriesAvoided,
      ...input,
    };

    const updatedLogs = [newLog, ...logs];
    await saveLogs(updatedLogs);
    return newLog;
  };

  const deleteLog = async (id: string) => {
    const updatedLogs = logs.filter(log => log.id !== id);
    await saveLogs(updatedLogs);
  };

  const getLogsByDateRange = (startDate: Date, endDate: Date) => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  };

  const getTodaysLogs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return getLogsByDateRange(today, tomorrow);
  };

  const getSuccessRate = (dateRange?: { start: Date; end: Date }) => {
    const logsToAnalyze = dateRange 
      ? getLogsByDateRange(dateRange.start, dateRange.end)
      : logs;

    if (logsToAnalyze.length === 0) return 0;

    const successfulLogs = logsToAnalyze.filter(log => log.isSuccess);
    return (successfulLogs.length / logsToAnalyze.length) * 100;
  };

  return {
    logs,
    addLog,
    deleteLog,
    getLogsByDateRange,
    getTodaysLogs,
    getSuccessRate,
  };
}; 