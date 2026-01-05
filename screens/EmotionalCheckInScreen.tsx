import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";
import { useApp } from "@/context/AppContext";

interface EmotionalState {
	id: string;
	label: string;
}

const EMOTIONAL_STATES: EmotionalState[] = [
	{
		id: "very_concerned",
		label: "Very concerned \u2014 I feel out of control",
	},
	{
		id: "somewhat_concerned",
		label: "Somewhat concerned \u2014 I'd like to cut back",
	},
	{
		id: "neutral",
		label: "Neutral \u2014 just want to be mindful",
	},
	{
		id: "not_concerned",
		label: "Not concerned \u2014 just want to track habits",
	},
	{
		id: "unsure",
		label: "I'm not sure how I feel",
	},
];

const EmotionalCheckInScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const [selectedState, setSelectedState] = useState("");
	const progress = useOnboardingProgress();
	const { updateOnboardingData } = useApp();

	const handleNext = () => {
		// Store the emotional state in local storage or context if needed
		updateOnboardingData({
			emotionalCheckIn: selectedState,
		});
		navigation.navigate("HowDoYouFeel");
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8 mt-12">
					<Text className="text-2xl font-bold mb-8 text-center text-blue-900">
						How do you feel about your ordering habits?
					</Text>

					<View className="space-y-4">
						{EMOTIONAL_STATES.map((state) => (
							<TouchableOpacity
								key={state.id}
								className={`flex-row items-center p-4 rounded-lg mb-4 bg-blue-50 border ${
									selectedState === state.id
										? "border-blue-50 bg-blue-50"
										: "border-white"
								}`}
								onPress={() => setSelectedState(state.id)}>
								<Text
									className={`flex-1 text-base ${
										selectedState === state.id
											? "text-blue-900 font-medium"
											: "text-gray-700"
									}`}>
									{state.label}
								</Text>
								<View
									className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
										selectedState === state.id
											? "border-blue-900 bg-blue-900"
											: "border-gray-300"
									}`}>
									{selectedState === state.id && (
										<Text className="text-white text-xs">✓</Text>
									)}
								</View>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>

				<View className="w-full p-6">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							selectedState ? "bg-blue-950" : "bg-gray-200"
						}`}
						onPress={handleNext}
						disabled={!selectedState}>
						<Text
							className={`text-center font-medium ${
								selectedState ? "text-white" : "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default EmotionalCheckInScreen;
