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

const EmotionalAnchorScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { onboardingData, updateOnboardingData } = useApp();
	const progress = useOnboardingProgress();

	const [motivation, setMotivation] = useState("");

	const handleNext = () => {
		if (!motivation.trim()) {
			Alert.alert("Missing Response", "Please share what matters to you");
			return;
		}

		updateOnboardingData({
			emotionalAnchor: motivation.trim(),
		});
		navigation.navigate("HealthyRelationship");
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8">
					<Text className="text-3xl font-bold mb-4 text-center mt-2 text-blue-900">
						Why does that matter to you?
					</Text>

					<Text className="text-base text-gray-600 mb-8 text-center">
						Share in your own words what motivates you to make this change
					</Text>

					<View className="space-y-4">
						<TextInput
							className="w-full min-h-[120px] p-4 rounded-lg border border-gray-200 text-base text-gray-900"
							placeholder="For example: I want to trust myself again, or I'm tired of feeling out of control..."
							placeholderTextColor="#9CA3AF"
							multiline
							textAlignVertical="top"
							value={motivation}
							onChangeText={setMotivation}
						/>
					</View>
				</ScrollView>

				<View className="p-6 bg-white">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							motivation.trim() ? "bg-blue-950" : "bg-gray-200"
						}`}
						onPress={handleNext}
						disabled={!motivation.trim()}>
						<Text
							className={`text-center font-medium ${
								motivation.trim() ? "text-white" : "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default EmotionalAnchorScreen; 