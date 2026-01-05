import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../context/AppContext";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

interface EmotionOption {
	id: string;
	label: string;
}

const EMOTIONS: EmotionOption[] = [
	{
		id: "regret",
		label: "Regret — I wish I hadn't ordered",
	},
	{
		id: "shame",
		label: "Shame — I feel bad about myself",
	},
	{
		id: "guilt",
		label: "Guilt — I feel like I let myself down",
	},
	{
		id: "enjoyment",
		label: "Enjoyment — I actually feel satisfied",
	},
	{
		id: "mixed",
		label: "Mixed feelings — It's complicated",
	},
];

const HowDoYouFeelScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { updateOnboardingData } = useApp();
	const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
	const progress = useOnboardingProgress();

	const handleNext = () => {
		if (selectedEmotion) {
			updateOnboardingData({
				howDoYouFeel: selectedEmotion,
			});
			navigation.navigate("Goal");
		}
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8 mt-12">
					<Text className="text-2xl font-bold mb-2 text-center text-blue-900">
						How Do You Feel?
					</Text>
					<Text className="text-base text-gray-600 mb-8 text-center">
						What emotion do you feel right after ordering when you didn't plan
						to?
					</Text>

					<View className="space-y-4">
						{EMOTIONS.map((emotion) => (
							<TouchableOpacity
								key={emotion.id}
								className={`flex-row items-center p-4 bg-blue-50 mb-4 rounded-lg border ${
									selectedEmotion === emotion.id
										? "border-blue-50 bg-blue-50"
										: "border-white"
								}`}
								onPress={() => setSelectedEmotion(emotion.id)}>
								<Text
									className={`flex-1 text-base ${
										selectedEmotion === emotion.id
											? "text-blue-900 font-medium"
											: "text-gray-700"
									}`}>
									{emotion.label}
								</Text>
								<View
									className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
										selectedEmotion === emotion.id
											? "border-blue-900 bg-blue-900"
											: "border-gray-300"
									}`}>
									{selectedEmotion === emotion.id && (
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
							selectedEmotion ? "bg-blue-950" : "bg-gray-200"
						}`}
						onPress={handleNext}
						disabled={!selectedEmotion}>
						<Text
							className={`text-center font-medium ${
								selectedEmotion ? "text-white" : "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default HowDoYouFeelScreen;
