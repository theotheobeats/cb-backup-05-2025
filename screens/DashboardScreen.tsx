import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { ScrollView } from "react-native-gesture-handler";
import { useMetrics } from "@/hooks/useMetrics";
import { useCravingLogs } from "@/hooks/useCravingLogs";
import {
  CravingLogInput,
  CravingIntensity,
  OnboardingData,
} from "@/types/models";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useApp } from "@/context/AppContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NavigationProps } from "@/types/navigation";

const APP_ICONS = {
  ubereats: require("../assets/app-icons/ubereats.png"),
  deliveroo: require("../assets/app-icons/deliveroo.png"),
  justeat: require("../assets/app-icons/justeat.png"),
  doordash: require("../assets/app-icons/doordash.png"),
  grubhub: require("../assets/app-icons/grubhub.png"),
  postmates: require("../assets/app-icons/postmates.png"),
};

const EMOTIONS = ["Stressed", "Bored", "Tired", "Happy", "Sad", "Anxious"];

const TRIGGERS = [
  "Work Stress",
  "Social Media",
  "TV/Movies",
  "Gaming",
  "Social Event",
  "Late Night",
  "Bad Day",
];

export const DashboardScreen: React.FC = () => {
  const { getMetrics } = useMetrics();
  const { addLog } = useCravingLogs();
  const [showLogModal, setShowLogModal] = useState(false);
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const metrics = getMetrics();
  const { onboardingData, updateOnboardingData } = useApp();
  const [status, setStatus] = useState<{
    progress: number;
    timeUntilBlock: { hours: number; minutes: number };
    isBlocked?: boolean;
    currentWindow?: string;
  }>({
    progress: 0,
    timeUntilBlock: { hours: 0, minutes: 0 },
    isBlocked: false,
    currentWindow: "Loading...",
  });
  const navigation = useNavigation<NavigationProps>();

  // Replace the initial useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      console.log("Dashboard: Screen focused, reloading user data");
      loadUserData();
    }, [])
  );

  // Keep the second useEffect for status updates
  useEffect(() => {
    console.log("Dashboard: Data state:", {
      hasUserData: !!userData,
      hasOnboardingData: !!onboardingData,
      userDataBlockingPlan: userData?.blockingPlan,
      onboardingDataBlockingPlan: onboardingData?.blockingPlan,
    });

    const currentData = userData || onboardingData;
    if (currentData?.blockingPlan) {
      const newStatus = getCurrentBlockingStatus();
      console.log("Dashboard: New status calculated:", newStatus);
      setStatus(newStatus);
    } else {
      console.log(
        "Dashboard: No blocking plan available in either userData or onboardingData"
      );
    }
  }, [userData, onboardingData]);

  const loadUserData = async () => {
    console.log("Dashboard: Loading user data");
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("userToken");

      console.log("Dashboard: Stored user data:", storedUserData);
      console.log("Dashboard: Token:", token);

      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        console.log("Dashboard: Parsed stored data:", parsedData);
        console.log(
          "SELECTED APPS ",
          JSON.stringify(parsedData.userData.appPreferences.selectedApps)
        );
        setUserData(parsedData.userData || parsedData);
      } else {
        try {
          console.log("Dashboard: Fetching from API");
          const response = await axios.get(
            "http://localhost:3000//api/general/user",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Dashboard: API response:", response.data);

          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(response.data.userData)
          );

          setUserData(response.data.userData);
          updateOnboardingData(response.data.userData);
        } catch (error) {
          console.error("Dashboard: Failed to fetch user data:", error);
          // Fallback to onboarding data if API fails
          console.log(
            "Dashboard: Falling back to onboarding data:",
            onboardingData
          );
          setUserData(onboardingData);
        }
      }
    } catch (error) {
      console.error("Dashboard: Error in loadUserData:", error);
    }
  };

  const getCurrentBlockingStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Use userData if available, otherwise fall back to onboardingData
    const currentData = userData || onboardingData;

    if (!currentData) {
      console.log("Dashboard: No user data available");
      return {
        isBlocked: false,
        timeUntilBlock: {
          hours: 0,
          minutes: 0,
        },
        currentWindow: "Loading...",
        progress: 0,
      };
    }

    // Get the current schedule based on day with null checks
    const schedule = isWeekend
      ? currentData.blockingPlan?.weekendSchedule
      : currentData.blockingPlan?.weekdaySchedule;

    if (!schedule || !currentData.blockingPlan) {
      console.log("Dashboard: No schedule available");
      return {
        isBlocked: false,
        timeUntilBlock: {
          hours: 0,
          minutes: 0,
        },
        currentWindow: "No schedule set",
        progress: 0,
      };
    }

    // Get the first time window
    const currentWindow = Object.keys(schedule)[0] || "";

    if (!currentWindow) {
      return {
        isBlocked: false,
        timeUntilBlock: {
          hours: 0,
          minutes: 0,
        },
        currentWindow: "No window set",
        progress: 0,
      };
    }

    // Parse the window times (format: "HH:mm-HH:mm" or "HH:mmAM-HH:mmPM")
    const [startTime, endTime] = currentWindow
      .split("-")
      .map((time) => time.trim());

    // Helper function to convert 12-hour format to 24-hour format
    const parse12HourTime = (
      timeStr: string
    ): { hour: number; minute: number } => {
      // Check if the time has AM/PM suffix
      const hasAMPM = /[APap][Mm]$/.test(timeStr);

      if (hasAMPM) {
        // Handle 12-hour format with AM/PM
        const isPM = /[Pp][Mm]$/.test(timeStr);
        const timePart = timeStr.replace(/[APap][Mm]$/, "").trim();
        const [hourStr, minuteStr] = timePart.split(":");
        let hour = parseInt(hourStr) || 0;

        // Convert to 24-hour format
        if (isPM && hour < 12) {
          hour += 12; // Add 12 to PM hours (except 12 PM)
        } else if (!isPM && hour === 12) {
          hour = 0; // 12 AM is 0 in 24-hour format
        }

        return {
          hour,
          minute: parseInt(minuteStr) || 0,
        };
      } else {
        // Handle 24-hour format
        const [hourStr, minuteStr] = timeStr.split(":");
        return {
          hour: parseInt(hourStr) || 0,
          minute: parseInt(minuteStr) || 0,
        };
      }
    };

    // Parse start and end times
    const { hour: startHour, minute: startMinute } = parse12HourTime(startTime);
    const { hour: endHour, minute: endMinute } = parse12HourTime(endTime);

    console.log(
      "Window time:",
      startHour,
      startMinute,
      "-",
      endHour,
      endMinute
    );
    console.log("Current time:", hour, minute);

    // Convert current time and window times to minutes since midnight
    const currentTimeInMinutes = hour * 60 + minute;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Handle case where end time is before start time (window spans across midnight)
    const windowSpansMidnight = endTimeInMinutes < startTimeInMinutes;

    // Check if we're currently in the blocking window
    let isInBlockingWindow;
    if (windowSpansMidnight) {
      isInBlockingWindow =
        currentTimeInMinutes >= startTimeInMinutes ||
        currentTimeInMinutes <= endTimeInMinutes;
    } else {
      isInBlockingWindow =
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes;
    }

    let minutesUntilNextBlock;
    let timeType = "";

    if (isInBlockingWindow) {
      // We're in the blocking window, calculate time until it ends
      timeType = "blockEnds";

      if (windowSpansMidnight && currentTimeInMinutes < endTimeInMinutes) {
        // Morning part of overnight window
        minutesUntilNextBlock = endTimeInMinutes - currentTimeInMinutes;
      } else if (windowSpansMidnight) {
        // Evening part of overnight window
        minutesUntilNextBlock =
          24 * 60 - currentTimeInMinutes + endTimeInMinutes;
      } else {
        // Regular window
        minutesUntilNextBlock = endTimeInMinutes - currentTimeInMinutes;
      }
    } else {
      // We're not in the blocking window, calculate time until it starts
      timeType = "blockStarts";

      if (currentTimeInMinutes < startTimeInMinutes) {
        // Before today's window
        minutesUntilNextBlock = startTimeInMinutes - currentTimeInMinutes;
      } else {
        // After today's window
        minutesUntilNextBlock =
          24 * 60 - currentTimeInMinutes + startTimeInMinutes;
      }
    }

    const hoursUntilBlock = Math.floor(minutesUntilNextBlock / 60);
    const remainingMinutes = minutesUntilNextBlock % 60;

    // Calculate progress through the day (0-100)
    const progress = Math.round((currentTimeInMinutes / (24 * 60)) * 100);

    console.log({
      currentTimeInMinutes,
      startTimeInMinutes,
      endTimeInMinutes,
      windowSpansMidnight,
      isInBlockingWindow,
      timeType,
      minutesUntilNextBlock,
      hoursUntilBlock,
      remainingMinutes,
    });

    return {
      isBlocked: isInBlockingWindow && Boolean(schedule[currentWindow]),
      timeUntilBlock: {
        hours: hoursUntilBlock,
        minutes: remainingMinutes,
      },
      currentWindow,
      progress: Math.min(100, Math.max(0, progress)), // Ensure progress is between 0-100
    };
  };

  // Modal state
  const [emotion, setEmotion] = useState<string>();
  const [intensity, setIntensity] = useState<CravingIntensity>();
  const [trigger, setTrigger] = useState<string>();
  const [blockedApp, setBlockedApp] = useState<string>();
  const [notes, setNotes] = useState<string>("");

  const validateForm = (): boolean => {
    if (!intensity) {
      Alert.alert("Missing Information", "Please select the craving intensity");
      return false;
    }
    if (!trigger) {
      Alert.alert(
        "Missing Information",
        "Please select what triggered this craving"
      );
      return false;
    }
    if (!blockedApp) {
      Alert.alert("Missing Information", "Please select which app you used");
      return false;
    }
    return true;
  };

  const handleLogSubmit = async () => {
    if (!validateForm()) return;

    const logInput: CravingLogInput = {
      isSuccess: false,
      emotion,
      intensity,
      trigger,
      blockedApp: blockedApp!,
      notes: notes.trim(),
    };

    const newLog = await addLog(logInput);
    resetForm();
    setShowLogModal(false);
    updateOnboardingData({
      cravingLog: [...onboardingData.cravingLog, newLog],
    });
  };

  const resetForm = () => {
    setEmotion(undefined);
    setIntensity(undefined);
    setTrigger(undefined);
    setBlockedApp(undefined);
    setNotes("");
  };

  // Get the current schedule based on current day
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const currentData = userData || onboardingData;
  const currentSchedule = isWeekend
    ? currentData?.blockingPlan?.weekendSchedule
    : currentData?.blockingPlan?.weekdaySchedule;
  const blockingWindow = currentSchedule ? Object.keys(currentSchedule)[0] : "";

  console.log(blockingWindow);

  // Get all selected app icons
  const getSelectedAppIcons = () => {
    const apps = currentData?.appPreferences?.selectedApps;
    if (!apps?.length) {
      return [APP_ICONS.ubereats];
    }
    return apps
      .slice(0, 4) // Limit to 4 apps
      .filter((app) => app in APP_ICONS) // Only include apps that we have icons for
      .map((app) => APP_ICONS[app as keyof typeof APP_ICONS]);
  };

  // Get selected apps for the modal
  const selectedApps = currentData?.appPreferences?.selectedApps || [
    "ubereats",
  ];

  return (
    <>
      <ScrollView className="flex-1 bg-slate-100">
        <View className="px-5 pt-4 pb-5 mt-12">
          <Text className="text-[30px] font-bold text-blue-950 mb-1 text-center">
            Your Plan Today
          </Text>
          <Text className="text-[15px] text-[#8E8E93] text-center">
            One step at a time — let's stay on track.
          </Text>
        </View>

        <View className="px-5 mb-4">
          <View className="bg-white rounded-2xl p-6 items-center shadow-sm relative">
            <View className="flex-row items-center justify-between gap-8">
              <CircularProgressBase
                value={status.progress}
                radius={70}
                activeStrokeWidth={14}
                inActiveStrokeWidth={14}
                strokeColorConfig={[
                  {
                    value: status.progress,
                    color: "#3B82F6",
                  },
                  {
                    value: 100 - status.progress,
                    color: "#E2E8F0",
                  },
                ]}
              >
                <View className="items-center">
                  <Text className="text-2xl font-bold text-[#4169E1]">
                    {`${status.timeUntilBlock.hours}h ${status.timeUntilBlock.minutes}m`}
                  </Text>
                  <Text className="text-sm text-[#8E8E93] mt-0.5">
                    until next block
                  </Text>
                </View>
              </CircularProgressBase>

              <View className="p-1.5 rounded-xl w-24 h-24 justify-center items-center overflow-hidden">
                <View className="flex-row flex-wrap w-full h-full">
                  {getSelectedAppIcons().map((icon, index) => (
                    <View
                      key={index}
                      className={`${
                        getSelectedAppIcons().length > 1
                          ? "w-1/2 h-1/2"
                          : "w-full h-full"
                      } p-0.5`}
                    >
                      <Image
                        source={icon}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-5 bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center gap-3 mb-0.5">
            <Text className="text-xl">⏰</Text>
            <Text className="text-base font-semibold text-[#1C1C1E] flex-1">
              {blockingWindow}
            </Text>
          </View>
          <Text className="text-sm text-[#8E8E93] ml-8">Blocking Window</Text>
        </View>

        <View className="mx-5 mb-4 bg-white rounded-2xl p-4 shadow-sm ">
          <View className="flex-row items-center gap-3 mb-0.5">
            <Text className="text-xl">🍕</Text>
            <Text className="text-base font-semibold text-[#1C1C1E] flex-1">
              {currentData?.blockingPlan?.cheatMealSlot}
            </Text>
          </View>
          <Text className="text-sm text-[#8E8E93] ml-8">Cheat Meal</Text>
        </View>

        <View className="mx-5 mb-4 bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center gap-3 mb-0.5">
            <Text className="text-xl">🎯</Text>
            <Text className="text-base font-semibold text-[#1C1C1E] flex-1">
              {metrics.currentStreak} days
            </Text>
          </View>
          <Text className="text-sm text-[#8E8E93] ml-8">Current Streak</Text>
        </View>

        <View className="flex-row justify-between px-5 mb-4">
          <View className="bg-white rounded-2xl p-4 w-[105px] shadow-sm">
            <View className="items-center">
              <View className="bg-violet-100 p-2 rounded-xl mb-2">
                <Text className="text-2xl">💰</Text>
              </View>
              <Text className="text-lg font-bold text-[#1C1C1E]">
                {metrics.moneySaved}
              </Text>
              <Text className="text-xs text-[#8E8E93]">Money</Text>
              <Text className="text-xs text-[#8E8E93]">Saved</Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 w-[105px] shadow-sm">
            <View className="items-center">
              <View className="bg-orange-100 p-2 rounded-xl mb-2">
                <Text className="text-2xl">🔥</Text>
              </View>
              <Text className="text-lg font-bold text-[#1C1C1E]">
                {metrics.caloriesAvoided}
              </Text>
              <Text className="text-xs text-[#8E8E93]">Calories</Text>
              <Text className="text-xs text-[#8E8E93]">Avoided</Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 w-[105px] shadow-sm">
            <View className="items-center">
              <View className="bg-green-100 p-2 rounded-xl mb-2">
                <Text className="text-2xl">🛡️</Text>
              </View>
              <Text className="text-lg font-bold text-[#1C1C1E]">
                {metrics.cravingsBlocked}
              </Text>
              <Text className="text-xs text-[#8E8E93]">Cravings</Text>
              <Text className="text-xs text-[#8E8E93]">Blocked</Text>
            </View>
          </View>
        </View>

        <View className="bg-[#3B82F6] mx-5 rounded-2xl p-4 mb-16 shadow-sm">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2"
            onPress={() => {
              resetForm();
              setShowLogModal(true);
            }}
          >
            <Text className="text-2xl">➕</Text>
            <Text className="text-white font-semibold text-base">
              Log Craving / Slip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Log Modal */}
      {showLogModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            elevation: 5,
            zIndex: 5000,
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            activeOpacity={1}
            onPress={() => setShowLogModal(false)}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              elevation: 6,
              zIndex: 5001,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            }}
          >
            {/* Modal Content */}
            <View className="p-4 border-b border-gray-200">
              <TouchableOpacity
                onPress={() => setShowLogModal(false)}
                className="absolute left-4 top-4 z-10"
              >
                <Text className="text-[#007AFF] text-[17px]">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-[17px] font-semibold text-center">
                Log Craving / Slip
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 480 }}>
              <View className="p-4 space-y-6">
                {/* Emotion Selection */}
                <View className="my-4">
                  <Text className="font-semibold mb-2">
                    How are you feeling?
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {EMOTIONS.map((e) => (
                      <TouchableOpacity
                        key={e}
                        onPress={() => setEmotion(e)}
                        className={`py-2 px-4 rounded-full ${
                          emotion === e ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={
                            emotion === e ? "text-white" : "text-gray-600"
                          }
                        >
                          {e}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Intensity Selection */}
                <View className="my-4">
                  <Text className="font-semibold mb-2">
                    How strong was the craving?
                  </Text>
                  <View className="flex-row gap-4">
                    {[1, 2, 3].map((level) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setIntensity(level as CravingIntensity)}
                        className={`flex-1 py-3 rounded-lg ${
                          intensity === level ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-center ${
                            intensity === level ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {"🔥".repeat(level)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Trigger Selection */}
                <View className="my-4">
                  <Text className="font-semibold mb-2">
                    What triggered this?
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {TRIGGERS.map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setTrigger(t)}
                        className={`py-2 px-4 rounded-full ${
                          trigger === t ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={
                            trigger === t ? "text-white" : "text-gray-600"
                          }
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* App Selection */}
                <View className="my-4">
                  <Text className="font-semibold mb-2">
                    Which app did you use?
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedApps.map((app) => (
                      <TouchableOpacity
                        key={app}
                        onPress={() => setBlockedApp(app)}
                        className={`py-2 px-4 rounded-full ${
                          blockedApp === app ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={
                            blockedApp === app ? "text-white" : "text-gray-600"
                          }
                        >
                          {app}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                <View className="my-4">
                  <Text className="font-semibold mb-2">
                    What happened? (Optional)
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Share your thoughts about what led to this slip..."
                    multiline
                    numberOfLines={3}
                    className="bg-gray-100 rounded-lg p-3"
                  />
                </View>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-200 pb-6">
              <TouchableOpacity
                onPress={handleLogSubmit}
                className="bg-[#3B82F6] py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Log Slip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default DashboardScreen;
