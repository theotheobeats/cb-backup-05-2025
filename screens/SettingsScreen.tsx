import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LockMode, OnboardingData } from "../types/models";
import axios from "axios";

const CHEAT_MEAL_OPTIONS = [
  { id: "saturday_lunch", label: "Saturday Lunch", time: "12 PM - 2 PM" },
  { id: "saturday_evening", label: "Saturday Evening", time: "6 PM - 8 PM" },
  { id: "sunday_lunch", label: "Sunday Lunch", time: "12 PM - 2 PM" },
  { id: "sunday_evening", label: "Sunday Evening", time: "6 PM - 8 PM" },
];

const LOCK_MODES = [
  {
    id: LockMode.Gentle,
    title: "Gentle",
    description:
      "Blocks food apps for 15 minutes, then prompts reflection and allows override",
  },
  {
    id: LockMode.Balanced,
    title: "Balanced",
    description:
      "Blocks food apps for 30 minutes, then prompts reflection and allows override",
  },
  {
    id: LockMode.Strict,
    title: "Strict",
    description:
      "Blocks food apps for 45 minutes, requires reflection and confirmation before override",
  },
  {
    id: LockMode.CompleteLockdown,
    title: "Complete Lockdown",
    description:
      "Full 24-hour lockdown with no override option until period ends",
  },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const ampm = hour < 12 ? "AM" : "PM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, "0")}:00`,
    label: `${hour12}:00 ${ampm}`,
  };
});

const SettingsScreen = () => {
  const { updateOnboardingData, updateBlockingPlan, resetApp } = useApp();
  const navigation = useNavigation<NavigationProps>();
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        const token = await AsyncStorage.getItem("userToken");

        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          const data = parsedData.userData || parsedData;
          setUserData({
            ...data,
            estimatedCalories: String(data.estimatedCalories),
            blockingPlan: {
              ...data.blockingPlan,
              lockMode: data.blockingPlan.lockMode as LockMode,
            },
          });
        } else {
          const response = await axios.get(
            "http://localhost:3000/api/general/user",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = response.data.userData;
          setUserData({
            ...data,
            estimatedCalories: String(data.estimatedCalories),
            blockingPlan: {
              ...data.blockingPlan,
              lockMode: data.blockingPlan.lockMode as LockMode,
            },
          });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        Alert.alert(
          "Error",
          "Failed to load user data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Form states - initialize with empty values and update when userData loads
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [blockingWindow, setBlockingWindow] = useState({
    startTime: "",
    endTime: "",
  });

  const [selectedCheatMeal, setSelectedCheatMeal] = useState("");
  const [selectedStrictness, setSelectedStrictness] = useState("");

  // Update form states when userData loads
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name,
        email: userData.email,
      });

      const schedule = userData.blockingPlan?.weekdaySchedule || {};
      const timeWindow = Object.keys(schedule)[0] || "";
      const [start, end] = timeWindow.split("-").map((t) => t.trim());

      setBlockingWindow({
        startTime: start || "",
        endTime: end || "",
      });

      setSelectedCheatMeal(userData.blockingPlan?.cheatMealSlot || "");
      setSelectedStrictness(userData.blockingPlan?.lockMode || "");
    }
  }, [userData]);

  // Modal visibility states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBlockingWindowModal, setShowBlockingWindowModal] = useState(false);
  const [showCheatMealModal, setShowCheatMealModal] = useState(false);
  const [showStrictnessModal, setShowStrictnessModal] = useState(false);

  const [notifications, setNotifications] = useState({
    weeklyReports: true,
    dailyReminders: true,
    emotionalCheckins: true,
    achievementAlerts: true,
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const newSettings = {
        ...prev,
        [key]: !prev[key],
      };
      // Save to AsyncStorage
      AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleSaveProfile = async () => {
    if (!userData) return;

    const updatedData = {
      ...userData,
      name: profileForm.name,
      email: profileForm.email,
    };

    try {
      // Update AsyncStorage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ userData: updatedData })
      );

      setUserData(updatedData);
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile changes. Please try again.");
    }

    setShowProfileModal(false);
  };

  const handleSaveBlockingWindow = async () => {
    if (!userData) return;

    const updatedData = {
      ...userData,
      blockingPlan: {
        ...userData.blockingPlan,
        weekdaySchedule: {
          [`${blockingWindow.startTime}-${blockingWindow.endTime}`]: true,
        },
        weekendSchedule: {
          [`${blockingWindow.startTime}-${blockingWindow.endTime}`]: true,
        },
        lockMode: (userData.blockingPlan?.lockMode ||
          LockMode.Gentle) as LockMode,
        cheatMealSlot: userData.blockingPlan?.cheatMealSlot || "",
      },
    };

    try {
      // Update AsyncStorage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ userData: updatedData })
      );

      // Update local state and context
      setUserData(updatedData);
      updateOnboardingData({
        ...updatedData,
        estimatedCalories: String(updatedData.estimatedCalories),
        blockingPlan: {
          ...updatedData.blockingPlan,
          lockMode: updatedData.blockingPlan.lockMode as LockMode,
        },
      });
    } catch (error) {
      console.error("Failed to save blocking window:", error);
      Alert.alert(
        "Error",
        "Failed to save blocking window changes. Please try again."
      );
    }

    setShowBlockingWindowModal(false);
  };

  const handleSaveCheatMeal = async () => {
    if (!userData) return;

    const cheatMealOption = CHEAT_MEAL_OPTIONS.find(
      (option) => option.id === selectedCheatMeal
    );
    if (!cheatMealOption) return;

    const updatedData = {
      ...userData,
      blockingPlan: {
        ...userData.blockingPlan,
        cheatMealSlot: cheatMealOption.label,
        lockMode: (userData.blockingPlan?.lockMode ||
          LockMode.Gentle) as LockMode,
        weekdaySchedule: userData.blockingPlan?.weekdaySchedule || {},
        weekendSchedule: userData.blockingPlan?.weekendSchedule || {},
      },
    };

    try {
      // Update AsyncStorage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ userData: updatedData })
      );

      // Update local state and context
      setUserData(updatedData);
      updateOnboardingData({
        ...updatedData,
        estimatedCalories: String(updatedData.estimatedCalories),
        blockingPlan: {
          ...updatedData.blockingPlan,
          lockMode: updatedData.blockingPlan.lockMode as LockMode,
        },
      });
    } catch (error) {
      console.error("Failed to save cheat meal:", error);
      Alert.alert(
        "Error",
        "Failed to save cheat meal changes. Please try again."
      );
    }

    setShowCheatMealModal(false);
  };

  const handleSaveStrictness = async () => {
    if (!userData) return;

    const updatedData = {
      ...userData,
      blockingPlan: {
        ...userData.blockingPlan,
        lockMode: selectedStrictness as LockMode,
        cheatMealSlot: userData.blockingPlan?.cheatMealSlot || "",
        weekdaySchedule: userData.blockingPlan?.weekdaySchedule || {},
        weekendSchedule: userData.blockingPlan?.weekendSchedule || {},
      },
    };

    try {
      // Update AsyncStorage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ userData: updatedData })
      );

      // Update local state and context
      setUserData(updatedData);
      updateOnboardingData({
        ...updatedData,
        estimatedCalories: String(updatedData.estimatedCalories),
        blockingPlan: {
          ...updatedData.blockingPlan,
          lockMode: updatedData.blockingPlan.lockMode as LockMode,
        },
      });
    } catch (error) {
      console.error("Failed to save strictness:", error);
      Alert.alert(
        "Error",
        "Failed to save strictness changes. Please try again."
      );
    }

    setShowStrictnessModal(false);
  };

  // const handleResetData = () => {
  // 	Alert.alert(
  // 		"Reset App Data",
  // 		"Are you sure you want to reset all app data? This action cannot be undone.",
  // 		[
  // 			{
  // 				text: "Cancel",
  // 				style: "cancel",
  // 			},
  // 			{
  // 				text: "Reset",
  // 				style: "destructive",
  // 				onPress: async () => {
  // 					try {
  // 						await resetApp();
  // 						navigation.navigate("OnboardingWelcome");
  // 					} catch (error) {
  // 						Alert.alert(
  // 							"Error",
  // 							"Failed to reset app data. Please try again."
  // 						);
  // 					}
  // 				},
  // 			},
  // 		]
  // 	);
  // };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            // Get the current user data and token from AsyncStorage
            const storedUserData = await AsyncStorage.getItem("userData");
            const token = await AsyncStorage.getItem("userToken");

            if (storedUserData && token) {
              // Parse the stored data
              const parsedData = JSON.parse(storedUserData);
              // Ensure we're sending data in the correct format
              const dataToSync = parsedData.userData
                ? parsedData
                : { userData: parsedData };

              // Sync data with server before logging out
              await axios.post(
                "http://localhost:3000/api/general/update-user",
                dataToSync,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
            }

            // Sign out from the server
            await axios.post("http://localhost:3000/api/auth/sign-out");

            // Clear AsyncStorage
            await AsyncStorage.clear();

            // Reset the navigation state and navigate to Login
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error("Axios error response:", error.response?.data);
              console.error("Axios error status:", error.response?.status);
              console.error("Axios error message:", error.message);
            } else {
              console.error("Unexpected error:", error);
            }
            Alert.alert(
              "Error",
              "Failed to sync data or log out. Please try again."
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView className="flex-1 bg-slate-100">
        {isLoading ? (
          <View className="flex-1 items-center justify-center mt-32">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600 font-medium">
              Loading your settings...
            </Text>
          </View>
        ) : (
          <>
            <View className="px-5 pt-4 pb-5 mt-12">
              <Text className="text-[30px] font-bold text-blue-950 mb-1">
                Settings
              </Text>
              <Text className="text-base text-blue-900/70">
                Customize your experience
              </Text>
            </View>

            {/* Profile Section */}
            <View className="mx-5 mb-4">
              <Text className="text-lg font-semibold text-[#1C1C1E] mb-2">
                Profile
              </Text>
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                    <Text className="text-2xl">��</Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-base font-semibold text-[#1C1C1E]">
                      {userData?.name || "Loading..."}
                    </Text>
                    <Text className="text-sm text-[#8E8E93]">
                      {userData?.email || "Loading..."}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-blue-50 p-3 rounded-xl"
                  onPress={() => setShowProfileModal(true)}
                >
                  <Text className="text-blue-600 text-center font-medium">
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Blocking Preferences */}
            <View className="mx-5 mb-4">
              <Text className="text-lg font-semibold text-[#1C1C1E] mb-2">
                Blocking Preferences
              </Text>
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <TouchableOpacity
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  onPress={() => setShowBlockingWindowModal(true)}
                >
                  <View>
                    <Text className="text-base font-medium text-[#1C1C1E]">
                      Blocking Window
                    </Text>
                    <Text className="text-sm text-[#8E8E93]">
                      {blockingWindow.startTime} - {blockingWindow.endTime}
                    </Text>
                  </View>
                  <Text className="text-xl">⏰</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  onPress={() => setShowCheatMealModal(true)}
                >
                  <View>
                    <Text className="text-base font-medium text-[#1C1C1E]">
                      Cheat Meal Slot
                    </Text>
                    <Text className="text-sm text-[#8E8E93]">
                      {userData?.blockingPlan?.cheatMealSlot || "Not set"}
                    </Text>
                  </View>
                  <Text className="text-xl">🍕</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-between py-3"
                  onPress={() => setShowStrictnessModal(true)}
                >
                  <View>
                    <Text className="text-base font-medium text-[#1C1C1E]">
                      Block Strictness
                    </Text>
                    <Text className="text-sm text-[#8E8E93]">
                      {userData?.blockingPlan?.lockMode || "Not set"}
                    </Text>
                  </View>
                  <Text className="text-xl">🔒</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications */}
            <View className="mx-5 mb-4">
              <Text className="text-lg font-semibold text-[#1C1C1E] mb-2">
                Notifications
              </Text>
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <Text className="text-base text-[#1C1C1E]">
                    Weekly Reports
                  </Text>
                  <Switch
                    value={notifications.weeklyReports}
                    onValueChange={() =>
                      handleNotificationToggle("weeklyReports")
                    }
                    trackColor={{ false: "#D1D1D6", true: "#3B82F6" }}
                  />
                </View>
                <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <Text className="text-base text-[#1C1C1E]">
                    Daily Reminders
                  </Text>
                  <Switch
                    value={notifications.dailyReminders}
                    onValueChange={() =>
                      handleNotificationToggle("dailyReminders")
                    }
                    trackColor={{ false: "#D1D1D6", true: "#3B82F6" }}
                  />
                </View>
                <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <Text className="text-base text-[#1C1C1E]">
                    Emotional Check-ins
                  </Text>
                  <Switch
                    value={notifications.emotionalCheckins}
                    onValueChange={() =>
                      handleNotificationToggle("emotionalCheckins")
                    }
                    trackColor={{ false: "#D1D1D6", true: "#3B82F6" }}
                  />
                </View>
                <View className="flex-row items-center justify-between py-3">
                  <Text className="text-base text-[#1C1C1E]">
                    Achievement Alerts
                  </Text>
                  <Switch
                    value={notifications.achievementAlerts}
                    onValueChange={() =>
                      handleNotificationToggle("achievementAlerts")
                    }
                    trackColor={{ false: "#D1D1D6", true: "#3B82F6" }}
                  />
                </View>
              </View>
            </View>

            {/* Danger Zone */}
            <View className="mx-5 mb-16">
              <Text className="text-lg font-semibold text-red-600 mb-2">
                Authentication
              </Text>
              <View className="bg-white rounded-2xl shadow-sm">
                {/* <TouchableOpacity
									className="p-4 border-b border-gray-100"
									onPress={handleResetData}>
									<View className="flex-row items-center">
										<Text className="text-xl mr-2">🔄</Text>
										<Text className="text-base text-red-600">Reset App Data</Text>
									</View>
								</TouchableOpacity> */}
                <TouchableOpacity
                  className="p-4"
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">🚪</Text>
                    <Text className="text-base text-red-600">
                      {isLoggingOut ? "Logging out..." : "Log Out"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowProfileModal(false)}
        >
          <View className="flex-1" />
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-xl font-semibold text-center">
                Edit Profile
              </Text>
            </View>
            <View className="p-6 space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-1">
                  Name
                </Text>
                <TextInput
                  value={profileForm.name}
                  onChangeText={(text) =>
                    setProfileForm((prev) => ({ ...prev, name: text }))
                  }
                  className="bg-gray-100 p-3 rounded-xl"
                  placeholder="Your name"
                />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-1">
                  Email
                </Text>
                <TextInput
                  value={profileForm.email}
                  onChangeText={(text) =>
                    setProfileForm((prev) => ({ ...prev, email: text }))
                  }
                  className="bg-gray-100 p-3 rounded-xl"
                  placeholder="Your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                onPress={handleSaveProfile}
                className="bg-blue-500 p-4 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Blocking Window Modal */}
      <Modal
        visible={showBlockingWindowModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBlockingWindowModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowBlockingWindowModal(false)}
        >
          <View className="flex-1" />
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-xl font-semibold text-center">
                Blocking Window
              </Text>
            </View>
            <ScrollView className="p-6 max-h-96">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Start Time
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-2">
                    {TIME_OPTIONS.map((time) => (
                      <TouchableOpacity
                        key={time.value}
                        onPress={() =>
                          setBlockingWindow((prev) => ({
                            ...prev,
                            startTime: time.value,
                          }))
                        }
                        className={`p-3 rounded-lg ${
                          blockingWindow.startTime === time.value
                            ? "bg-blue-500"
                            : ""
                        }`}
                      >
                        <Text
                          className={`${
                            blockingWindow.startTime === time.value
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {time.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    End Time
                  </Text>
                  <View className="bg-gray-100 rounded-xl p-2">
                    {TIME_OPTIONS.map((time) => (
                      <TouchableOpacity
                        key={time.value}
                        onPress={() =>
                          setBlockingWindow((prev) => ({
                            ...prev,
                            endTime: time.value,
                          }))
                        }
                        className={`p-3 rounded-lg ${
                          blockingWindow.endTime === time.value
                            ? "bg-blue-500"
                            : ""
                        }`}
                      >
                        <Text
                          className={`${
                            blockingWindow.endTime === time.value
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {time.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
            <View className="p-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSaveBlockingWindow}
                className="bg-blue-500 p-4 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Cheat Meal Modal */}
      <Modal
        visible={showCheatMealModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCheatMealModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowCheatMealModal(false)}
        >
          <View className="flex-1" />
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-xl font-semibold text-center">
                Cheat Meal Slot
              </Text>
            </View>
            <View className="p-6">
              <View className="space-y-3">
                {CHEAT_MEAL_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedCheatMeal(option.id)}
                    className={`p-4 rounded-xl border ${
                      selectedCheatMeal === option.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedCheatMeal === option.id
                          ? "text-blue-500"
                          : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text
                      className={
                        selectedCheatMeal === option.id
                          ? "text-blue-500"
                          : "text-gray-500"
                      }
                    >
                      {option.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleSaveCheatMeal}
                className="bg-blue-500 p-4 rounded-xl mt-6"
              >
                <Text className="text-white text-center font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Strictness Modal */}
      <Modal
        visible={showStrictnessModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStrictnessModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowStrictnessModal(false)}
        >
          <View className="flex-1" />
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-xl font-semibold text-center">
                Block Strictness
              </Text>
            </View>
            <ScrollView className="p-6">
              <View className="space-y-3">
                {LOCK_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    onPress={() => setSelectedStrictness(mode.id)}
                    className={`p-4 rounded-xl border ${
                      selectedStrictness === mode.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-medium mb-1 ${
                        selectedStrictness === mode.id
                          ? "text-blue-500"
                          : "text-gray-900"
                      }`}
                    >
                      {mode.title}
                    </Text>
                    <Text
                      className={
                        selectedStrictness === mode.id
                          ? "text-blue-500"
                          : "text-gray-500"
                      }
                    >
                      {mode.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="p-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSaveStrictness}
                className="bg-blue-500 p-4 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Loading Modal */}
      <Modal visible={isLoggingOut} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-700 font-medium">
              Logging out...
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SettingsScreen;
