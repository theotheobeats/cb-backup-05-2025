import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { useApp } from "../context/AppContext";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const RELATIONSHIP_OPTIONS = [
	{
		id: "once_week",
		label: "Only once a week",
		icon: "📅",
	},
	{
		id: "planned",
		label: "Only when planned in advance",
		icon: "📝",
	},
	{
		id: "special_occasions",
		label: "Only for special occasions",
		icon: "🎉",
	},
	{
		id: "mindful",
		label: "More mindful, less impulsive",
		icon: "🧘",
	},
	{
		id: "budget",
		label: "Within my monthly budget",
		icon: "💰",
	},
	{
		id: "stop",
		label: "I want to stop completely",
		icon: "🚫",
	},
];

const HealthyRelationshipScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { updateOnboardingData } = useApp();
	const progress = useOnboardingProgress();

	const [selectedOption, setSelectedOption] = useState("");

	const handleNext = () => {
		updateOnboardingData({
			healthyRelationship: selectedOption,
		});
		navigation.navigate("Concern");
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8">
					<Text className="text-3xl font-bold mb-4 text-center mt-2 text-blue-900">
						What does a healthy relationship with food delivery look like for you?
					</Text>

					<Text className="text-base text-gray-600 mb-8 text-center">
						Choose the option that best describes your goal
					</Text>

					<View className="space-y-4">
						{RELATIONSHIP_OPTIONS.map((option) => (
							<TouchableOpacity
								key={option.id}
								className={`flex-row items-center p-4 rounded-lg border ${
									selectedOption === option.id
										? "border-blue-500 bg-blue-50"
										: "border-gray-200"
								}`}
								onPress={() => setSelectedOption(option.id)}>
								<View className="flex-row items-center justify-between flex-1">
									<View className="flex-row items-center">
										<Text className="mr-2 text-lg">{option.icon}</Text>
										<Text
											className={`text-base ${
												selectedOption === option.id
													? "text-blue-500 font-medium"
													: "text-gray-700"
											}`}>
											{option.label}
										</Text>
									</View>

									<View
										className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
											selectedOption === option.id
												? "border-blue-900 bg-blue-900"
												: "border-gray-300"
										}`}>
										{selectedOption === option.id && (
											<Text className="text-white text-xs">✓</Text>
										)}
									</View>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>

				<View className="p-6 bg-white">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							selectedOption ? "bg-blue-950" : "bg-gray-200"
						}`}
						onPress={handleNext}
						disabled={!selectedOption}>
						<Text
							className={`text-center font-medium ${
								selectedOption ? "text-white" : "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default HealthyRelationshipScreen; 