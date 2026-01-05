import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";
import { useApp } from "@/context/AppContext";

interface Concern {
  id: string;
  label: string;
  icon?: string;
}

const CONCERNS: Concern[] = [
  {
    id: "weight_gain",
    label: "Weight Gain",
    icon: "⚖️",
  },
  {
    id: "financial_impact",
    label: "Financial Impact",
    icon: "💰",
  },
  {
    id: "both",
    label: "Both",
    icon: "✓",
  },
];

const ConcernScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [selectedConcern, setSelectedConcern] = useState("");
  const progress = useOnboardingProgress();
  const { updateOnboardingData } = useApp();

  const handleNext = () => {
    updateOnboardingData({
      concerns: selectedConcern,
    });
    navigation.navigate("Motivation");
  };

  return (
    <>
      <ProgressBar progress={progress} />
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1 p-8 mt-16">
          <Text className="text-2xl font-bold mb-8 text-center">
            What concerns you most about your takeout habits?
          </Text>

          <View className="space-y-4">
            {CONCERNS.map((concern) => (
              <TouchableOpacity
                key={concern.id}
                className={`flex-row items-center p-4 mb-4 rounded-lg border ${
                  selectedConcern === concern.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onPress={() => setSelectedConcern(concern.id)}
              >
                <View className="flex-row items-center justify-between flex-1">
                  <View className="flex-row items-center">
                    {concern.icon && (
                      <Text className="mr-2 text-lg">{concern.icon}</Text>
                    )}
                    <Text
                      className={`text-base ${
                        selectedConcern === concern.id
                          ? "text-blue-500 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {concern.label}
                    </Text>
                  </View>

                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedConcern === concern.id
                        ? "border-blue-900 bg-blue-900"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedConcern === concern.id && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="w-full p-6">
          <TouchableOpacity
            className={`w-full p-4 rounded-xl ${
              selectedConcern ? "bg-blue-950" : "bg-gray-200"
            }`}
            onPress={handleNext}
            disabled={!selectedConcern}
          >
            <Text
              className={`text-center font-medium ${
                selectedConcern ? "text-white" : "text-gray-400"
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

export default ConcernScreen;
