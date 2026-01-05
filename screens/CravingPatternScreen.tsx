import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { useApp } from "../context/AppContext";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const CRAVING_TIMES = [
	{ id: "evening", label: "Evening" },
	{ id: "late_night", label: "Late night" },
	{ id: "after_work", label: "After work" },
	{ id: "weekends", label: "Weekends" },
	{ id: "after_drinking", label: "After drinking" },
	{ id: "other", label: "Other" },
];

const TRIGGERS = [
	{ id: "stress", label: "Stress" },
	{ id: "tiredness", label: "Tiredness" },
	{ id: "loneliness", label: "Loneliness" },
	{ id: "boredom", label: "Boredom" },
	{ id: "i_deserve_it", label: "I deserve it" },
	{ id: "streaming", label: "Streaming / Netflix" },
	{ id: "no_trigger_just_habit", label: "No trigger, just habit" },
];

const CravingPatternScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { updateOnboardingData } = useApp();
	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
	const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
	const progress = useOnboardingProgress();

	const toggleTime = (timeId: string) => {
		setSelectedTimes((prev) =>
			prev.includes(timeId)
				? prev.filter((id) => id !== timeId)
				: [...prev, timeId]
		);
	};

	const toggleTrigger = (triggerId: string) => {
		setSelectedTriggers((prev) =>
			prev.includes(triggerId)
				? prev.filter((id) => id !== triggerId)
				: [...prev, triggerId]
		);
	};

	const handleNext = () => {
		updateOnboardingData({
			cravingPatterns: {
				cravingTimes: selectedTimes,
				triggers: selectedTriggers,
			},
		});
		navigation.navigate("BlockingPlan");
	};

	const CheckboxOption = ({
		id,
		label,
		selected,
		onToggle,
	}: {
		id: string;
		label: string;
		selected: boolean;
		onToggle: () => void;
	}) => (
		<TouchableOpacity
			onPress={onToggle}
			className={`flex-row justify-between bg-blue-50 p-4 rounded-lg mb-4 items-center py-3 border-gray-100 ${
				selected ? "border-blue-900" : "border-gray-300"
			}`}>
			<Text className={`text-base $`}>{label}</Text>
			<View
				className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
					selected ? "border-blue-900 bg-blue-900" : "border-gray-300"
				}`}>
				{selected && <Text className="text-white text-xs">✓</Text>}
			</View>
		</TouchableOpacity>
	);

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 px-8 mt-8">
					<Text className="text-2xl font-bold text-blue-900 mt-6 mb-8">
						Let's learn how your cravings behave
					</Text>

					<View className="mb-8">
						<Text className="text-lg font-medium mb-4">
							When do cravings usually hit hardest? (Select all that apply)
						</Text>
						{CRAVING_TIMES.map((time) => (
							<CheckboxOption
								key={time.id}
								id={time.id}
								label={time.label}
								selected={selectedTimes.includes(time.id)}
								onToggle={() => toggleTime(time.id)}
							/>
						))}
					</View>

					<View className="mb-8">
						<Text className="text-lg font-medium mb-4">
							What tends to trigger you? (Select all that apply)
						</Text>
						{TRIGGERS.map((trigger) => (
							<CheckboxOption
								key={trigger.id}
								id={trigger.id}
								label={trigger.label}
								selected={selectedTriggers.includes(trigger.id)}
								onToggle={() => toggleTrigger(trigger.id)}
							/>
						))}
					</View>
				</ScrollView>

				<View className="p-6 border-t border-gray-100">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							selectedTimes.length > 0 && selectedTriggers.length > 0
								? "bg-blue-950"
								: "bg-gray-200"
						}`}
						onPress={handleNext}
						disabled={
							selectedTimes.length === 0 || selectedTriggers.length === 0
						}>
						<Text
							className={`text-center font-medium ${
								selectedTimes.length > 0 && selectedTriggers.length > 0
									? "text-white"
									: "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default CravingPatternScreen;
