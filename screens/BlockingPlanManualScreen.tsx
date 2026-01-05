import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { useApp } from "../context/AppContext";
import { LockMode } from "../types/models";

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
		warning:
			"This is the most restrictive option and cannot be overridden once activated",
	},
];

const TIME_SLOTS = [
	{ id: "morning", label: "Morning (6 AM - 12 PM)" },
	{ id: "afternoon", label: "Afternoon (12 PM - 6 PM)" },
	{ id: "evening", label: "Evening (6 PM - 12 AM)" },
	{ id: "night", label: "Night (12 AM - 6 AM)" },
];

const BLOCK_DAYS = [
	{ id: "weekdays", label: "Weekdays", description: "Monday to Friday" },
	{ id: "weekends", label: "Weekends", description: "Saturday and Sunday" },
];

const CHEAT_MEAL_OPTIONS = [
	{ id: "saturday_lunch", label: "Saturday Lunch", time: "12 PM - 2 PM" },
	{ id: "saturday_evening", label: "Saturday Evening", time: "6 PM - 8 PM" },
	{ id: "sunday_lunch", label: "Sunday Lunch", time: "12 PM - 2 PM" },
	{ id: "sunday_evening", label: "Sunday Evening", time: "6 PM - 8 PM" },
];

const BlockingPlanManualScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { updateOnboardingData } = useApp();
	const [selectedMode, setSelectedMode] = useState<LockMode>(LockMode.Gentle);
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
	const [selectedCheatMeal, setSelectedCheatMeal] =
		useState("saturday_evening");

	const toggleDay = (dayId: string) => {
		setSelectedDays((prev) =>
			prev.includes(dayId)
				? prev.filter((id) => id !== dayId)
				: [...prev, dayId]
		);
	};

	const toggleTime = (timeId: string) => {
		setSelectedTimes((prev) =>
			prev.includes(timeId)
				? prev.filter((id) => id !== timeId)
				: [...prev, timeId]
		);
	};

	const handleNext = () => {
		const selectedCheatMealOption = CHEAT_MEAL_OPTIONS.find(
			(option) => option.id === selectedCheatMeal
		);

		updateOnboardingData({
			blockingPlan: {
				lockMode: selectedMode,
				weekdaySchedule: selectedDays.includes("weekdays")
					? {
							"Early Morning (5-9 AM)": selectedTimes.includes("morning"),
							"Late Morning (9-12 PM)": selectedTimes.includes("morning"),
							"Early Afternoon (12-3 PM)": selectedTimes.includes("afternoon"),
							"Late Afternoon (3-6 PM)": selectedTimes.includes("afternoon"),
							"Evening (6-9 PM)": selectedTimes.includes("evening"),
							"Late Night (9 PM-12 AM)": selectedTimes.includes("evening"),
							"Night (12-5 AM)": selectedTimes.includes("night"),
					  }
					: {},
				weekendSchedule: selectedDays.includes("weekends")
					? {
							"Early Morning (5-9 AM)": selectedTimes.includes("morning"),
							"Late Morning (9-12 PM)": selectedTimes.includes("morning"),
							"Early Afternoon (12-3 PM)": selectedTimes.includes("afternoon"),
							"Late Afternoon (3-6 PM)": selectedTimes.includes("afternoon"),
							"Evening (6-9 PM)": selectedTimes.includes("evening"),
							"Late Night (9 PM-12 AM)": selectedTimes.includes("evening"),
							"Night (12-5 AM)": selectedTimes.includes("night"),
					  }
					: {},
				cheatMealSlot: selectedCheatMealOption
					? selectedCheatMealOption.label
					: "Saturday Evening",
			},
		});
		navigation.navigate("ThreeMonthsOutlook");
	};

	return (
		<View className="flex-1 bg-white">
			<ScrollView className="flex-1 p-8 mt-16">
				<View className="mb-8">
					<Text className="text-lg font-semibold mb-4">Block Level</Text>
					{LOCK_MODES.map((mode) => (
						<TouchableOpacity
							key={mode.id}
							onPress={() => setSelectedMode(mode.id)}
							className={`p-4 rounded-lg mb-2 ${
								selectedMode === mode.id
									? "bg-blue-50 border border-blue-500"
									: "border border-gray-200"
							}`}>
							<Text
								className={`font-medium mb-1 ${
									selectedMode === mode.id ? "text-blue-500" : "text-gray-900"
								}`}>
								{mode.title}
							</Text>
							<Text
								className={
									selectedMode === mode.id ? "text-blue-500" : "text-gray-500"
								}>
								{mode.description}
							</Text>
							{mode.warning && (
								<Text className="text-red-500 mt-2 text-sm">
									{mode.warning}
								</Text>
							)}
						</TouchableOpacity>
					))}
				</View>

				<View className="mb-8">
					<Text className="text-lg font-semibold mb-4">Block Days</Text>
					<View className="space-y-2">
						{BLOCK_DAYS.map((day) => (
							<TouchableOpacity
								key={day.id}
								onPress={() => toggleDay(day.id)}
								className={`p-4 rounded-lg border ${
									selectedDays.includes(day.id)
										? "border-blue-500 bg-blue-50"
										: "border-gray-200"
								}`}>
								<Text
									className={`font-medium ${
										selectedDays.includes(day.id)
											? "text-blue-500"
											: "text-gray-900"
									}`}>
									{day.label}
								</Text>
								<Text
									className={
										selectedDays.includes(day.id)
											? "text-blue-500"
											: "text-gray-500"
									}>
									{day.description}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View className="mb-8">
					<Text className="text-lg font-semibold mb-4">Block Times</Text>
					<View className="space-y-2">
						{TIME_SLOTS.map((time) => (
							<TouchableOpacity
								key={time.id}
								onPress={() => toggleTime(time.id)}
								className={`p-4 rounded-lg border ${
									selectedTimes.includes(time.id)
										? "border-blue-500 bg-blue-50"
										: "border-gray-200"
								}`}>
								<Text
									className={
										selectedTimes.includes(time.id)
											? "text-blue-500"
											: "text-gray-600"
									}>
									{time.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View className="mb-8">
					<Text className="text-lg font-semibold mb-4">Cheat Meal Window</Text>
					<View className="space-y-2">
						{CHEAT_MEAL_OPTIONS.map((option) => (
							<TouchableOpacity
								key={option.id}
								onPress={() => setSelectedCheatMeal(option.id)}
								className={`p-4 rounded-lg border ${
									selectedCheatMeal === option.id
										? "border-blue-500 bg-blue-50"
										: "border-gray-200"
								}`}>
								<Text
									className={`font-medium ${
										selectedCheatMeal === option.id
											? "text-blue-500"
											: "text-gray-900"
									}`}>
									{option.label}
								</Text>
								<Text
									className={
										selectedCheatMeal === option.id
											? "text-blue-500"
											: "text-gray-500"
									}>
									{option.time}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>

			<View className="p-8 border-t border-gray-100">
				<TouchableOpacity
					className={`w-full p-4 rounded-xl ${
						selectedMode && selectedDays.length > 0 && selectedTimes.length > 0
							? "bg-blue-950"
							: "bg-gray-200"
					}`}
					disabled={
						!selectedMode ||
						selectedDays.length === 0 ||
						selectedTimes.length === 0
					}
					onPress={handleNext}>
					<Text
						className={`text-center font-medium ${
							selectedMode &&
							selectedDays.length > 0 &&
							selectedTimes.length > 0
								? "text-white"
								: "text-gray-400"
						}`}>
						Save Settings
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default BlockingPlanManualScreen;
