import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  NativeModules,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { useApp } from "../context/AppContext";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const DELIVERY_APPS = [
  {
    id: "ubereats",
    label: "Uber Eats",
    icon: require("@/assets/app-icons/ubereats.png"),
  },
  {
    id: "deliveroo",
    label: "Deliveroo",
    icon: require("@/assets/app-icons/deliveroo.png"),
  },
  {
    id: "justeat",
    label: "Just Eat",
    icon: require("@/assets/app-icons/justeat.png"),
  },
  {
    id: "doordash",
    label: "DoorDash",
    icon: require("@/assets/app-icons/doordash.png"),
  },
  {
    id: "grubhub",
    label: "GrubHub",
    icon: require("@/assets/app-icons/grubhub.png"),
  },
  {
    id: "postmates",
    label: "Postmates",
    icon: require("@/assets/app-icons/postmates.png"),
  },
];

const AppSelectionScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { updateOnboardingData } = useApp();
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const progress = useOnboardingProgress();

  useEffect(() => {
    const result = NativeModules.CraveBlockManager.requestAuthorization();
    NativeModules.CraveBlockManager.selectApps((selectedApps: string[]) => {
      console.log("Selected apps:", selectedApps);
      // selectedApps - array example ["com.ubercab.UberEATS", "com.deliveroo.orderapp"])
    });
  });
  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleNext = () => {
    updateOnboardingData({
      appPreferences: {
        selectedApps,
      },
    });
    navigation.navigate("CravingPattern");
  };

  return (
    <>
      <ProgressBar progress={progress} />
      <View className="flex-1 bg-white">
        <View className="flex-1 p-8 mt-12">
          <Text className="text-2xl font-bold mb-2 text-center">
            Which apps do you use?
          </Text>
          <Text className="text-base text-gray-500 mb-6 text-center">
            Select the food delivery apps that are your biggest temptations.
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {DELIVERY_APPS.map((app) => (
              <TouchableOpacity
                key={app.id}
                onPress={() => toggleApp(app.id)}
                className={`w-[31%] aspect-square mb-4 rounded-xl border ${
                  selectedApps.includes(app.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                } items-center justify-center p-2`}
              >
                <Image
                  source={app.icon}
                  className="w-12 h-12 mb-2"
                  resizeMode="contain"
                />
                <Text
                  className={`text-sm text-center ${
                    selectedApps.includes(app.id)
                      ? "text-blue-500"
                      : "text-gray-700"
                  }`}
                >
                  {app.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base text-gray-500 mb-6 text-center">
            You can adjust this later in the settings.
          </Text>
        </View>

        <View className="p-6">
          <TouchableOpacity
            className={`w-full p-4 rounded-xl ${
              selectedApps.length > 0 ? "bg-blue-950" : "bg-gray-200"
            }`}
            onPress={handleNext}
            disabled={selectedApps.length === 0}
          >
            <Text
              className={`text-center font-medium ${
                selectedApps.length > 0 ? "text-white" : "text-gray-400"
              }`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AppSelectionScreen;
