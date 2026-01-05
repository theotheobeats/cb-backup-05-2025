import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { useApp } from "../context/AppContext";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const PREDEFINED_GOALS = [
	{
		id: "weight_loss",
		title: "Lose weight",
		icon: "⚖️",
	},
	{
		id: "save_money",
		title: "Save money",
		icon: "💰",
	},
	{
		id: "control",
		title: "Feel in control",
		icon: "🎯",
	},
	{
		id: "stop_guilt",
		title: "Stop feeling guilty",
		icon: "🫶",
	},
	{
		id: "consistency",
		title: "Build consistency",
		icon: "📈",
	},
	{
		id: "health",
		title: "Improve health",
		icon: "❤️",
	},
	{
		id: "energy",
		title: "Have more energy",
		icon: "⚡",
	},
	{
		id: "confidence",
		title: "Boost confidence",
		icon: "💪",
	},
];

const GoalScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { onboardingData, updateOnboardingData } = useApp();
	const progress = useOnboardingProgress();

	const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
	const [customGoal, setCustomGoal] = useState("");
	const [showCustomInput, setShowCustomInput] = useState(false);

	const handleGoalToggle = (goalId: string) => {
		setSelectedGoals((prev) => {
			if (prev.includes(goalId)) {
				return prev.filter((id) => id !== goalId);
			}
			if (prev.length >= 3) {
				Alert.alert("Maximum Goals", "Please select up to 3 goals");
				return prev;
			}
			return [...prev, goalId];
		});
	};

	const handleCustomGoalToggle = () => {
		if (showCustomInput) {
			setShowCustomInput(false);
			setCustomGoal("");
			setSelectedGoals((prev) =>
				prev.filter((goal) => !goal.startsWith("custom_"))
			);
		} else {
			if (selectedGoals.length >= 3) {
				Alert.alert("Maximum Goals", "Please select up to 3 goals");
				return;
			}
			setShowCustomInput(true);
		}
	};

	const handleCustomGoalSubmit = () => {
		if (customGoal.trim()) {
			setSelectedGoals((prev) => [...prev, `custom_${customGoal}`]);
			setShowCustomInput(false);
		}
	};

	const handleNext = () => {
		if (selectedGoals.length === 0) {
			Alert.alert("Select Goals", "Please select at least one goal");
			return;
		}

		updateOnboardingData({
			goals: selectedGoals,
		});
		navigation.navigate("EmotionalAnchor");
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8">
					<Text className="text-3xl font-bold mb-8 text-center mt-2 text-blue-900">
						What would change if you stopped giving in to cravings?
					</Text>
					<Text className="text-base text-gray-600 mb-8 text-center">
						Select up to 3 goals that matter most to you
					</Text>
					<View className="space-y-4">
						{PREDEFINED_GOALS.map((goal) => (
							<TouchableOpacity
								key={goal.id}
								className={`flex-row items-center p-4 rounded-lg border ${
									selectedGoals.includes(goal.id)
										? "border-blue-500 bg-blue-50"
										: "border-gray-200"
								}`}
								onPress={() => handleGoalToggle(goal.id)}>
								<View className="flex-row items-center justify-between flex-1">
									<View className="flex-row items-center">
										<Text className="mr-2 text-lg">{goal.icon}</Text>
										<Text
											className={`text-base ${
												selectedGoals.includes(goal.id)
													? "text-blue-500 font-medium"
													: "text-gray-700"
											}`}>
											{goal.title}
										</Text>
									</View>

									<View
										className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
											selectedGoals.includes(goal.id)
												? "border-blue-900 bg-blue-900"
												: "border-gray-300"
										}`}>
										{selectedGoals.includes(goal.id) && (
											<Text className="text-white text-xs">✓</Text>
										)}
									</View>
								</View>
							</TouchableOpacity>
						))}

						{/* <TouchableOpacity
							className={`flex-row items-center p-4 rounded-lg border ${
								showCustomInput
									? "border-blue-500 bg-blue-50"
									: "border-gray-200"
							}`}
							onPress={handleCustomGoalToggle}>
							<View className="flex-row items-center justify-between flex-1">
								<View className="flex-row items-center">
									<Text className="mr-2 text-lg">✨</Text>
									<Text
										className={`text-base ${
											showCustomInput
												? "text-blue-500 font-medium"
												: "text-gray-700"
										}`}>
										Other
									</Text>
								</View>

								<View
									className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
										showCustomInput
											? "border-blue-900 bg-blue-900"
											: "border-gray-300"
									}`}>
									{showCustomInput && (
										<Text className="text-white text-xs">✓</Text>
									)}
								</View>
							</View>
						</TouchableOpacity> */}
					</View>
					{showCustomInput && (
						<View className="mt-4">
							<TextInput
								className="w-full border border-gray-200 rounded-lg p-3 text-base"
								placeholder="Enter your goal"
								value={customGoal}
								onChangeText={setCustomGoal}
								onSubmitEditing={handleCustomGoalSubmit}
								returnKeyType="done"
							/>
							<TouchableOpacity
								className="mt-2 bg-blue-500 p-2 rounded-lg"
								onPress={handleCustomGoalSubmit}>
								<Text className="text-white text-center">Add Custom Goal</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
				<View className="p-6 bg-white">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							selectedGoals.length > 0 ? "bg-blue-950" : "bg-gray-300"
						}`}
						onPress={handleNext}
						disabled={selectedGoals.length === 0}>
						<Text className="text-white text-center font-medium">Continue</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default GoalScreen;
