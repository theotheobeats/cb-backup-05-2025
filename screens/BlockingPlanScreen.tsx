import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Switch,
	Pressable,
	Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../context/AppContext";
import { NavigationProps } from "../types/navigation";
import { LockMode } from "../types/models";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const formatCravingTimes = (times: string[]) => {
	const readableTimes = times.map((time) => {
		// Convert snake_case to Title Case
		return time
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	});

	if (readableTimes.length === 1) return readableTimes[0];
	if (readableTimes.length === 2)
		return `${readableTimes[0]} & ${readableTimes[1]}`;
	return readableTimes.join(", ");
};

const formatTriggers = (triggers: string[]) => {
	if (!triggers.length) return "Not specified";

	const readableTriggers = triggers.map((trigger) => {
		return trigger
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	});

	if (readableTriggers.length === 1) return readableTriggers[0];
	if (readableTriggers.length === 2)
		return `${readableTriggers[0]} & ${readableTriggers[1]}`;
	return readableTriggers.join(", ");
};

const getLockModeText = (mode: LockMode) => {
	switch (mode) {
		case LockMode.Gentle:
			return "Gentle Reminder";
		case LockMode.Balanced:
			return "Speed Bump";
		case LockMode.Strict:
			return "Strict Control";
		default:
			return "Speed Bump";
	}
};

// Add time options
const TIME_OPTIONS = [
	"12:00 AM",
	"1:00 AM",
	"2:00 AM",
	"3:00 AM",
	"4:00 AM",
	"5:00 AM",
	"6:00 AM",
	"7:00 AM",
	"8:00 AM",
	"9:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"1:00 PM",
	"2:00 PM",
	"3:00 PM",
	"4:00 PM",
	"5:00 PM",
	"6:00 PM",
	"7:00 PM",
	"8:00 PM",
	"9:00 PM",
	"10:00 PM",
	"11:00 PM",
];

// Add day options
const DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

// Add time windows
const MEAL_WINDOWS = [
	"12:00 PM-4:00 PM",
	"1:00 PM-5:00 PM",
	"2:00 PM-6:00 PM",
	"3:00 PM-7:00 PM",
	"4:00 PM-8:00 PM",
	"5:00 PM-9:00 PM",
	"6:00 PM-10:00 PM",
];

const BlockingPlanScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const {
		onboardingData,
		updateOnboardingData,
		createPersonalizedBlockingPlan,
	} = useApp();
	const progress = useOnboardingProgress();

	// Get personalized plan
	const personalizedPlan = createPersonalizedBlockingPlan();

	// Extract the time windows from the schedules
	const weekdayTimeWindow =
		Object.keys(personalizedPlan.weekdaySchedule)[0] || "6:00 PM-3:00 AM";
	const weekendTimeWindow =
		Object.keys(personalizedPlan.weekendSchedule)[0] || "8:00 AM-3:00 AM";

	const [weekdayEnabled, setWeekdayEnabled] = useState(
		Object.values(personalizedPlan.weekdaySchedule)[0] ?? true
	);
	const [weekendEnabled, setWeekendEnabled] = useState(
		Object.values(personalizedPlan.weekendSchedule)[0] ?? true
	);
	const [weekdayStart, setWeekdayStart] = useState(
		weekdayTimeWindow.split("-")[0]
	);
	const [weekdayEnd, setWeekdayEnd] = useState(weekdayTimeWindow.split("-")[1]);
	const [weekendStart, setWeekendStart] = useState(
		weekendTimeWindow.split("-")[0]
	);
	const [weekendEnd, setWeekendEnd] = useState(weekendTimeWindow.split("-")[1]);

	const [showCheatMealPicker, setShowCheatMealPicker] = useState(false);
	const [selectedDay, setSelectedDay] = useState(
		personalizedPlan.cheatMealSlot.split(",")[0].trim()
	);
	const [selectedWindow, setSelectedWindow] = useState(
		personalizedPlan.cheatMealSlot.split(",")[1].trim()
	);

	const handleCheatMealChange = (day: string, window: string) => {
		const newCheatMealSlot = `${day}, ${window}`;
		personalizedPlan.cheatMealSlot = newCheatMealSlot;
		setShowCheatMealPicker(false);
	};

	const handleNext = () => {
		updateOnboardingData({
			blockingPlan: {
				lockMode: personalizedPlan.lockMode,
				cheatMealSlot:
					selectedWindow && selectedDay
						? selectedDay + " " + selectedWindow
						: personalizedPlan.cheatMealSlot,
				weekdaySchedule: {
					[`${weekdayStart}-${weekdayEnd}`]: weekdayEnabled,
				},
				weekendSchedule: {
					[`${weekendStart}-${weekendEnd}`]: weekendEnabled,
				},
			},
		});
		navigation.navigate("ThreeMonthsOutlook");
	};

	const InfoRow = ({
		icon,
		label,
		value,
	}: {
		icon: string;
		label: string;
		value: string;
	}) => (
		<View className="flex-1 mb-6">
			<View className="flex-row items-center mb-1">
				<Text className="text-lg mr-1">{icon}</Text>
				<Text className="text-gray-500 text-sm">{label}</Text>
			</View>
			<Text className="text-base font-medium">{value}</Text>
		</View>
	);

	const TimeSelector = ({
		label,
		startTime,
		endTime,
		enabled,
		onToggle,
		onStartTimeChange,
		onEndTimeChange,
	}: {
		label: string;
		startTime: string;
		endTime: string;
		enabled: boolean;
		onToggle: (value: boolean) => void;
		onStartTimeChange: (time: string) => void;
		onEndTimeChange: (time: string) => void;
	}) => {
		const [showStartPicker, setShowStartPicker] = useState(false);
		const [showEndPicker, setShowEndPicker] = useState(false);

		return (
			<View className="mb-6 px-8">
				<View className="flex-row items-center justify-between mb-2">
					<Text className="font-bold">{label}</Text>
					<Switch
						value={enabled}
						onValueChange={onToggle}
						trackColor={{ false: "#E5E7EB", true: "#172554" }}
						thumbColor={"#FFFFFF"}
						ios_backgroundColor="#E5E7EB"
						style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
					/>
				</View>
				<View className="flex-row items-center gap-2">
					<TouchableOpacity
						className="flex-1 flex-row items-center justify-between rounded-lg px-4 py-3 bg-gray-50"
						onPress={() => setShowStartPicker(true)}>
						<Text className="text-gray-900">{startTime}</Text>
						<Text className="text-gray-400">▼</Text>
					</TouchableOpacity>
					<Text className="text-gray-600">to</Text>
					<TouchableOpacity
						className="flex-1 flex-row items-center justify-between rounded-lg px-4 py-3 bg-gray-50"
						onPress={() => setShowEndPicker(true)}>
						<Text className="text-gray-900">{endTime}</Text>
						<Text className="text-gray-400">▼</Text>
					</TouchableOpacity>
				</View>

				<Modal
					transparent={true}
					visible={showStartPicker}
					onRequestClose={() => setShowStartPicker(false)}>
					<View className="flex-1 justify-center items-center bg-black/50">
						<View className="bg-white rounded-xl w-4/5 max-h-96">
							<View className="p-4 border-b border-gray-200">
								<Text className="text-lg font-bold text-center">
									Select Start Time
								</Text>
							</View>
							<ScrollView className="p-4">
								{TIME_OPTIONS.map((time) => (
									<TouchableOpacity
										key={time}
										onPress={() => {
											onStartTimeChange(time);
											setShowStartPicker(false);
										}}
										className="py-3 px-4 border-b border-gray-100">
										<Text
											className={`text-center ${
												time === startTime
													? "text-blue-500 font-bold"
													: "text-gray-700"
											}`}>
											{time}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
							<TouchableOpacity
								onPress={() => setShowStartPicker(false)}
								className="p-4 border-t border-gray-200">
								<Text className="text-center text-blue-500">Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>

				<Modal
					transparent={true}
					visible={showEndPicker}
					onRequestClose={() => setShowEndPicker(false)}>
					<View className="flex-1 justify-center items-center bg-black/50">
						<View className="bg-white rounded-xl w-4/5 max-h-96">
							<View className="p-4 border-b border-gray-200">
								<Text className="text-lg font-bold text-center">
									Select End Time
								</Text>
							</View>
							<ScrollView className="p-4">
								{TIME_OPTIONS.map((time) => (
									<TouchableOpacity
										key={time}
										onPress={() => {
											onEndTimeChange(time);
											setShowEndPicker(false);
										}}
										className="py-3 px-4 border-b border-gray-100">
										<Text
											className={`text-center ${
												time === endTime
													? "text-blue-500 font-bold"
													: "text-gray-700"
											}`}>
											{time}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
							<TouchableOpacity
								onPress={() => setShowEndPicker(false)}
								className="p-4 border-t border-gray-200">
								<Text className="text-center text-blue-500">Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		);
	};

	const CheatMealPicker = () => (
		<Modal
			transparent={true}
			visible={showCheatMealPicker}
			onRequestClose={() => setShowCheatMealPicker(false)}>
			<View className="flex-1 justify-center items-center bg-black/50">
				<View className="bg-white rounded-xl w-11/12 max-h-[80%]">
					<View className="p-4 border-b border-gray-200">
						<Text className="text-lg font-bold text-center">
							Change Cheat Meal Window
						</Text>
					</View>
					<ScrollView className="p-4">
						<Text className="font-bold mb-2">Select Day</Text>
						<View className="mb-6">
							{DAYS.map((day) => (
								<TouchableOpacity
									key={day}
									onPress={() => setSelectedDay(day)}
									className={`py-3 px-4 border-b border-gray-100 ${
										day === selectedDay ? "bg-blue-50" : ""
									}`}>
									<Text
										className={`${
											day === selectedDay
												? "text-blue-500 font-bold"
												: "text-gray-700"
										}`}>
										{day}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						<Text className="font-bold mb-2">Select Time Window</Text>
						<View>
							{MEAL_WINDOWS.map((window) => (
								<TouchableOpacity
									key={window}
									onPress={() => setSelectedWindow(window)}
									className={`py-3 px-4 border-b border-gray-100 ${
										window === selectedWindow ? "bg-blue-50" : ""
									}`}>
									<Text
										className={`${
											window === selectedWindow
												? "text-blue-500 font-bold"
												: "text-gray-700"
										}`}>
										{window}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
					<View className="p-4 border-t border-gray-200 flex-row justify-end gap-4">
						<TouchableOpacity
							onPress={() => setShowCheatMealPicker(false)}
							className="py-2 px-4">
							<Text className="text-gray-500">Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => handleCheatMealChange(selectedDay, selectedWindow)}
							className="bg-blue-900 py-2 px-4 rounded-lg">
							<Text className="text-white font-medium">Save Changes</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);

	return (
		<>
			<ProgressBar progress={progress} />
			<ScrollView className="flex-1 bg-white">
				<Text className="text-2xl font-bold mb-2 px-8 text-center mt-">
					Here's your personalized blocking plan
				</Text>
				<Text className="text-gray-500 mb-8 px-8 text-center">
					Built from your cravings, triggers, and goals — but fully in your
					control.
				</Text>

				<View className="px-8 bg-slate-100 rounded-xl shadow-sm mx-8 p-8 mb-8">
					<View className="flex flex-row gap-4">
						<InfoRow
							icon="⏰"
							label="Craving Time"
							value={formatCravingTimes(
								onboardingData.cravingPatterns.cravingTimes
							)}
						/>
						<InfoRow
							icon="🧠"
							label="Trigger"
							value={formatTriggers(onboardingData.cravingPatterns.triggers)}
						/>
					</View>
					<View className="flex flex-row">
						<InfoRow
							icon="🔒"
							label="Mode"
							value={getLockModeText(personalizedPlan.lockMode)}
						/>
						<InfoRow
							icon="🍕"
							label="Cheat Meal"
							value={personalizedPlan.cheatMealSlot}
						/>
					</View>
				</View>

				<TimeSelector
					label="Weekday Blocking"
					startTime={weekdayStart}
					endTime={weekdayEnd}
					enabled={weekdayEnabled}
					onToggle={setWeekdayEnabled}
					onStartTimeChange={setWeekdayStart}
					onEndTimeChange={setWeekdayEnd}
				/>

				<TimeSelector
					label="Weekend Blocking"
					startTime={weekendStart}
					endTime={weekendEnd}
					enabled={weekendEnabled}
					onToggle={setWeekendEnabled}
					onStartTimeChange={setWeekendStart}
					onEndTimeChange={setWeekendEnd}
				/>

				<View className="mt-4 px-8">
					<View className="flex-row items-center mb-4">
						<Text className="font-bold flex-1 text-center">
							🍕 Your cheat meal window is:{" "}
							{selectedWindow && selectedDay
								? selectedDay + " " + selectedWindow
								: personalizedPlan.cheatMealSlot}
						</Text>
					</View>
					<TouchableOpacity
						className="bg-gray-100 rounded-lg py-2 px-4 self-center mb-2"
						onPress={() => setShowCheatMealPicker(true)}>
						<Text className="text-sm text-gray-600">Change this</Text>
					</TouchableOpacity>
				</View>

				<CheatMealPicker />

				<View className="border-t border-gray-200 my-8 mx-8" />

				<View className="px-8">
					<Text className="text-sm text-slate-600 text-center font-bold mb-2">
						Want full control?
					</Text>
					<TouchableOpacity
						className="border border-gray-300 rounded-lg py-3 mb-4"
						onPress={() => navigation.navigate("BlockingPlanManual")}>
						<Text className="text-gray-700 text-center">Choose for myself</Text>
					</TouchableOpacity>
				</View>

				<View className="px-8 mb-8">
					<TouchableOpacity
						className="bg-blue-950 rounded-lg py-3 mb-4"
						onPress={handleNext}>
						<Text className="text-white text-center">
							Looks good - continue
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</>
	);
};

export default BlockingPlanScreen;
