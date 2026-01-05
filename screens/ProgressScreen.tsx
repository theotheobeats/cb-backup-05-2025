import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useMetrics } from "@/hooks/useMetrics";
import { useCravingLogs } from "@/hooks/useCravingLogs";
import { useApp } from "@/context/AppContext";
const ProgressScreen = () => {
	const screenWidth = Dimensions.get("window").width;
	const { getMetrics } = useMetrics();
	const { getLogsByDateRange } = useCravingLogs();
	const { onboardingData } = useApp();

	// Get real metrics
	const metrics = getMetrics();

	// Calculate weekly stats
	const getWeeklyData = () => {
		const today = new Date();
		const weekStart = new Date(today);
		weekStart.setDate(today.getDate() - 6); // Get last 7 days

		const weeklyLogs = getLogsByDateRange(weekStart, today);
		const dailyCounts = Array(7).fill(0);

		weeklyLogs.forEach((log) => {
			const dayIndex =
				6 -
				Math.floor(
					(today.getTime() - new Date(log.timestamp).getTime()) /
						(1000 * 60 * 60 * 24)
				);
			if (dayIndex >= 0 && dayIndex < 7) {
				dailyCounts[dayIndex]++;
			}
		});

		return dailyCounts;
	};

	// Get weekly data for the chart
	const weeklyData = {
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		datasets: [
			{
				data: getWeeklyData(),
			},
		],
	};

	// Calculate achievements based on real data
	const achievements = [
		{
			id: 1,
			title: "Money Saver",
			description: `Saved £${metrics.moneySaved}!`,
			emoji: "💰",
			achieved: metrics.moneySaved >= 100,
		},
		{
			id: 2,
			title: "Craving Crusher",
			description: `Blocked ${metrics.cravingsBlocked} cravings`,
			emoji: "💪",
			achieved: metrics.cravingsBlocked >= 10,
		},
		{
			id: 3,
			title: "Health Champion",
			description: `Avoided ${metrics.caloriesAvoided} calories`,
			emoji: "🏆",
			achieved: metrics.caloriesAvoided >= 3000,
		},
		{
			id: 4,
			title: "Consistency King",
			description: `${metrics.currentStreak}-day streak`,
			emoji: "👑",
			achieved: metrics.currentStreak >= 5,
		},
	];

	// Generate motivational message based on metrics
	const getMotivationalMessage = () => {
		if (metrics.currentStreak > 0) {
			return `🔥 ${metrics.currentStreak} day streak! Keep going!`;
		}
		if (metrics.moneySaved > 0) {
			return `💰 You've saved £${metrics.moneySaved} so far!`;
		}
		if (metrics.cravingsBlocked > 0) {
			return `💪 You've blocked ${metrics.cravingsBlocked} cravings!`;
		}
		return "🎯 Start tracking your progress today!";
	};


	return (
		<ScrollView className="flex-1 bg-slate-100">
			<View className="px-5 pt-4 pb-5 mt-12">
				<Text className="text-[30px] font-bold text-blue-950 mb-1 text-center">
					Your Progress
				</Text>
				<Text className="text-base text-blue-900/70 text-center">
					{getMotivationalMessage()}
				</Text>
			</View>

			{/* Stats Overview */}
			<View className="flex-row justify-between px-5 mb-4">
				<View className="bg-white rounded-2xl p-4 w-[105px] shadow-sm">
					<View className="items-center">
						<View className="bg-violet-100 p-2 rounded-xl mb-2">
							<Text className="text-2xl">💰</Text>
						</View>
						<Text className="text-lg font-bold text-[#1C1C1E]">
							£{metrics.moneySaved}
						</Text>
						<Text className="text-xs text-[#8E8E93]">Money</Text>
						<Text className="text-xs text-[#8E8E93]">Saved</Text>
					</View>
				</View>

				<View className="bg-white rounded-2xl p-4 w-[105px] shadow-sm">
					<View className="items-center">
						<View className="bg-orange-100 p-2 rounded-xl mb-2">
							<Text className="text-2xl">🔥</Text>
						</View>
						<Text className="text-lg font-bold text-[#1C1C1E]">
							{metrics.caloriesAvoided}
						</Text>
						<Text className="text-xs text-[#8E8E93]">Calories</Text>
						<Text className="text-xs text-[#8E8E93]">Avoided</Text>
					</View>
				</View>

				<View className="bg-white rounded-2xl p-4 w-[105px] shadow-sm">
					<View className="items-center">
						<View className="bg-green-100 p-2 rounded-xl mb-2">
							<Text className="text-2xl">🛡️</Text>
						</View>
						<Text className="text-lg font-bold text-[#1C1C1E]">
							{metrics.cravingsBlocked}
						</Text>
						<Text className="text-xs text-[#8E8E93]">Cravings</Text>
						<Text className="text-xs text-[#8E8E93]">Blocked</Text>
					</View>
				</View>
			</View>

			{/* Weekly Trend */}
			<View className="mx-5 mb-4">
				<Text className="text-lg font-semibold text-[#1C1C1E] mb-2">
					Weekly Cravings
				</Text>
				<View className="bg-white rounded-2xl p-4 shadow-sm">
					<LineChart
						data={weeklyData}
						width={screenWidth - 50}
						height={180}
						chartConfig={{
							backgroundColor: "#ffffff",
							backgroundGradientFrom: "#ffffff",
							backgroundGradientTo: "#ffffff",
							decimalPlaces: 0,
							color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
							style: {
								borderRadius: 16,
							},
							propsForDots: {
								r: "6",
								strokeWidth: "2",
								stroke: "#3B82F6",
							},
							propsForBackgroundLines: {
								stroke: "#E2E8F0",
							},
						}}
						bezier
						style={{
							borderRadius: 16,
							paddingRight: 0,
						}}
					/>
				</View>
			</View>

			{/* Achievements */}
			<View className="mx-5 mb-8">
				<Text className="text-lg font-semibold text-[#1C1C1E] mb-2">
					Achievements
				</Text>
				{achievements.map((achievement) => (
					<View
						key={achievement.id}
						className={`bg-white rounded-2xl p-4 shadow-sm mb-2 ${
							achievement.achieved ? "border-l-4 border-blue-500" : ""
						}`}>
						<View className="flex-row items-center">
							<View
								className={`p-2 rounded-xl mr-3 ${
									achievement.achieved ? "bg-blue-100" : "bg-gray-100"
								}`}>
								<Text className="text-2xl">{achievement.emoji}</Text>
							</View>
							<View className="flex-1">
								<Text className="text-base font-semibold text-[#1C1C1E]">
									{achievement.title}
								</Text>
								<Text className="text-sm text-[#8E8E93]">
									{achievement.description}
								</Text>
							</View>
							{achievement.achieved && (
								<View className="bg-blue-100 rounded-full p-1">
									<Text className="text-xl">✅</Text>
								</View>
							)}
						</View>
					</View>
				))}
			</View>

			{/* Log History */}
			<View className="mx-5 mb-16">
				<Text className="text-lg font-semibold text-[#1C1C1E] mb-2">
					Log History
				</Text>
				{onboardingData.cravingLog.length === 0 ? (
					<View className="bg-white rounded-2xl p-6 shadow-sm items-center">
						<Text className="text-2xl mb-2">📝</Text>
						<Text className="text-base text-gray-600 text-center">
							No logs yet. Start tracking your cravings to see your history
							here!
						</Text>
					</View>
				) : (
					onboardingData.cravingLog.map((log) => (
						<View
							key={log.id}
							className="bg-white rounded-2xl p-4 shadow-sm mb-2">
							<View className="flex-row items-center mb-2">
								<View className="bg-blue-100 p-2 rounded-xl mr-3">
									<Text className="text-xl">{log.isSuccess ? "🛡️" : "❌"}</Text>
								</View>
								<View className="flex-1">
									<Text className="text-base font-semibold text-[#1C1C1E]">
										{log.isSuccess ? "Craving Blocked" : "Slip Logged"}
									</Text>
									<Text className="text-sm text-[#8E8E93]">
										{log.timestamp
											? new Date(log.timestamp).toLocaleString("en-US", {
													month: "short",
													day: "numeric",
													hour: "numeric",
													minute: "numeric",
													hour12: true,
												})
											: "N/A"}
									</Text>
								</View>
								{log.isSuccess && (
									<View className="bg-green-100 rounded-full px-3 py-1">
										<Text className="text-sm text-green-700 font-medium">
											+£{log.spendingAvoided || 0}
										</Text>
									</View>
								)}
							</View>

							<View className="flex-row flex-wrap gap-2 mb-2">
								{log.emotion && (
									<View className="bg-gray-100 px-3 py-1 rounded-full">
										<Text className="text-sm text-gray-600">
											Feeling: {log.emotion}
										</Text>
									</View>
								)}
								{log.trigger && (
									<View className="bg-gray-100 px-3 py-1 rounded-full">
										<Text className="text-sm text-gray-600">
											Trigger: {log.trigger}
										</Text>
									</View>
								)}
								{log.intensity && (
									<View className="bg-gray-100 px-3 py-1 rounded-full">
										<Text className="text-sm text-gray-600">
											{"🔥".repeat(log.intensity)}
										</Text>
									</View>
								)}
							</View>

							{log.notes && (
								<Text className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
									{log.notes}
								</Text>
							)}
						</View>
					))
				)}
			</View>
		</ScrollView>
	);
};

export default ProgressScreen;
