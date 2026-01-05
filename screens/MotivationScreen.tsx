import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const MotivationScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const progress = useOnboardingProgress();

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<View className="flex-1 px-8 pb-4 pt-4 mt-12">
					<Text className="text-4xl font-bold text-center text-blue-900 mb-8">
						You're not lazy. You're just stuck in a loop.
					</Text>

					<Image
						source={require("../assets/app-icons/upsetman.png")}
						className="w-full h-[325px] mb-8 mt-4"
						resizeMode="contain"
					/>
	
					<View className="space-y-4 p-2">
						<View className="flex-row items-start">
							<Text className="text-lg mr-2">•</Text>
							<Text className="text-base flex-1 text-gray-700">
								Cravings aren't hunger — they're dopamine and stress.
							</Text>
						</View>

						<View className="flex-row items-start">
							<Text className="text-lg mr-2">•</Text>
							<Text className="text-base flex-1 text-gray-700">
								CraveBlock doesn't shame you — it protects you.
							</Text>
						</View>

						<View className="flex-row items-start">
							<Text className="text-lg mr-2">•</Text>
							<Text className="text-base flex-1 text-gray-700">
								Save money. Avoid regret. Stay in control.
							</Text>
						</View>
					</View>
				</View>

				<View className="p-6">
					<TouchableOpacity
						className="w-full bg-blue-950 p-4 rounded-xl"
						onPress={() => navigation.navigate("AppSelection")}>
						<Text className="text-white text-center font-medium">Continue</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default MotivationScreen;
