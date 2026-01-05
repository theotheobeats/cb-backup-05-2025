import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Modal,
	Pressable,
	TextInput,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@react-navigation/native";
import { useApp } from "../context/AppContext";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";
import axios from "axios";
import { COUNTRY_CODES } from "@/constants";
import ActionSheet from "@/components/ActionSheet";

const FREQUENCY_OPTIONS = [
	"1-2 times a week",
	"2-3 times a week",
	"3-4 times a week",
	"4-5 times a week",
	"5+ times a week",
];

const BASE_SPEND_RANGES = [5, 10, 15, 20, 30, 40, 50];

interface CurrencyInfo {
	code: string;
	symbol: string;
	rate: number;
}

interface SpendRangeOption {
	value: string;
	label: string;
}

interface FormErrors {
	frequency?: string;
	spendRange?: string;
	calories?: string;
}

const TakeoutHabitsScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { onboardingData, updateOnboardingData } = useApp();

	const [frequency, setFrequency] = useState(
		onboardingData.takeoutFrequency || ""
	);
	const [spendRange, setSpendRange] = useState<string>(
		onboardingData.spendRange || ""
	);
	const [calories, setCalories] = useState(
		onboardingData.estimatedCalories || "1,300"
	);
	const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
	const [showSpendPicker, setShowSpendPicker] = useState(false);
	const [showCaloriesPicker, setShowCaloriesPicker] = useState(false);
	const [tempCalories, setTempCalories] = useState("");
	const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
		code: "GBP",
		symbol: "£",
		rate: 1,
	});
	const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
	const [spendRangeModalVisible, setSpendRangeModalVisible] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

	const progress = useOnboardingProgress();

	useEffect(() => {
		getLocalizedCurrency();
	}, []);

	const getLocalizedCurrency = async () => {
		try {
			setIsLoadingCurrency(true);
			const countryCode = COUNTRY_CODES[onboardingData?.location] || "GB";

			// Get currency information based on country code
			const response = await axios.get(
				`https://restcountries.com/v3.1/alpha/${countryCode}`
			);

			if (response.data && response.data[0]?.currencies) {
				const currencyCode = Object.keys(response.data[0].currencies)[0];
				const currencySymbol = response.data[0].currencies[currencyCode].symbol;

				setCurrencyInfo({
					code: currencyCode,
					symbol: currencySymbol,
					rate: 1, // Keep rate as 1 to maintain original values
				});
			}
		} catch (error) {
			console.error("Error fetching currency info:", error);
			// Fallback to GBP if there's an error
		} finally {
			setIsLoadingCurrency(false);
		}
	};

	const formatAmount = (amount: number) => {
		return `${currencyInfo.symbol}${amount.toFixed(2)}`;
	};

	const getSpendRanges = (currency: string): SpendRangeOption[] => {
		return BASE_SPEND_RANGES.map((value) => ({
			value: value.toString(),
			label: formatAmount(value),
		}));
	};

	// Calculate monthly stats
	const monthlyStats = {
		orders: frequency
			? (() => {
					try {
						// Handle "5+ times a week" case
						if (frequency.includes("+")) {
							return 5 * 4; // Use 5 as the base for "5+"
						}
						const matches = frequency.match(/(\d+)-?(\d+)?/);
						if (!matches) return 0;
						const min = parseInt(matches[1], 10);
						return min * 4;
					} catch (error) {
						console.error("Error calculating orders:", error);
						return 0;
					}
			  })()
			: 0,
		spend:
			spendRange && frequency
				? (() => {
						try {
							const spendAmount = parseFloat(spendRange);
							if (isNaN(spendAmount)) return 0;

							let freqAmount = 0;
							if (frequency.includes("+")) {
								freqAmount = 5;
							} else {
								const matches = frequency.match(/(\d+)-?(\d+)?/);
								if (!matches) return 0;
								freqAmount = parseInt(matches[1], 10);
							}

							return spendAmount * freqAmount * 4;
						} catch (error) {
							console.error("Error calculating spend:", error);
							return 0;
						}
				  })()
				: 0,
		calories:
			calories && frequency
				? (() => {
						try {
							const cleanCalories = typeof calories === 'string' 
								? parseInt(calories.replace(/,/g, ""), 10)
								: parseInt(calories.toString(), 10);

							// Get frequency
							let freqAmount = 0;
							if (frequency.includes("+")) {
								freqAmount = 5;
							} else {
								const matches = frequency.match(/(\d+)-?(\d+)?/);
								if (!matches) return 0;
								freqAmount = parseInt(matches[1], 10);
							}

							return cleanCalories * freqAmount * 4;
						} catch (error) {
							console.error("Error calculating calories:", error);
							return 0;
						}
				  })()
				: 0,
	};

	const validateForm = () => {
		const newErrors: FormErrors = {};

		if (!frequency) {
			newErrors.frequency = "Please select your order frequency";
		}

		if (!spendRange) {
			newErrors.spendRange = "Please select your average spend";
		}

		if (!calories) {
			newErrors.calories = "Please enter estimated calories";
		} else {
			const caloriesNum = parseInt(calories.toString().replace(/,/g, ""), 10);
			if (isNaN(caloriesNum) || caloriesNum < 100 || caloriesNum > 5000) {
				newErrors.calories = "Please enter a realistic calorie amount (100-5000)";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		setTouched({
			frequency: true,
			spendRange: true,
			calories: true,
		});

		if (validateForm()) {
			updateOnboardingData({
				takeoutFrequency: frequency,
				spendRange: spendRange,
				estimatedCalories: calories,
				monthlyStats: monthlyStats,
			});
			navigation.navigate("EmotionalCheckIn");
		} else {
			Alert.alert(
				"Missing Information",
				"Please fill in all required fields correctly"
			);
		}
	};

	const handleTouch = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		validateForm();
	};

	// Update the Done button handler
	const handleCaloriesDone = () => {
		if (tempCalories) {
			setCalories(tempCalories);
		}
		setShowCaloriesPicker(false);
	};

	// Initialize tempCalories when opening the modal
	const handleOpenCaloriesPicker = () => {
		setTempCalories(calories.toString());
		setShowCaloriesPicker(true);
	};

	const spendRangeOptions = getSpendRanges(currencyInfo.code);

	const validateSpendRange = (value: string) => {
		if (!value) return false;
		const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		return !isNaN(numericValue) && numericValue > 0;
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8 mt-12">
					<Text className="text-4xl font-bold mb-12 text-center max-w-md mx-auto text-blue-900">
						Let's get a sense of your takeout habits.
					</Text>

					<View className="space-y-6">
						<View className="mb-4">
							<View className="flex-row items-center gap-2 mb-2">
								<Text>🕒</Text>
								<Text className="text-base font-medium text-gray-800 mr-2">
									How many times do you order takeout per week?
								</Text>
							</View>
							<TouchableOpacity
								className={`w-full border rounded-lg p-3 flex-row justify-between items-center ${
									touched.frequency && errors.frequency
										? "border-red-500"
										: "border-gray-200"
								}`}
								onPress={() => {
									setShowFrequencyPicker(true);
									handleTouch("frequency");
								}}>
								<Text className={frequency ? "text-gray-900" : "text-gray-400"}>
									{frequency || "Select frequency"}
								</Text>
								<Text className="text-gray-400">⌄</Text>
							</TouchableOpacity>
							{touched.frequency && errors.frequency && (
								<Text className="text-red-500 text-sm mt-1">
									{errors.frequency}
								</Text>
							)}
						</View>

						<View className="mb-4">
							<View className="flex-row items-center gap-2 mb-2">
								<Text>{currencyInfo.symbol}</Text>
								<Text className="text-base font-medium text-gray-800 mr-2">
									What's your average spend per order?
								</Text>
							</View>
							<TouchableOpacity
								className={`w-full border rounded-lg p-3 flex-row justify-between items-center ${
									touched.spendRange && errors.spendRange
										? "border-red-500"
										: "border-gray-200"
								}`}
								onPress={() => {
									setShowSpendPicker(true);
									handleTouch("spendRange");
								}}>
								<Text
									className={
										validateSpendRange(spendRange)
											? "text-gray-900"
											: "text-gray-400"
									}>
									{validateSpendRange(spendRange)
										? formatAmount(
												parseFloat(spendRange.replace(/[^0-9.]/g, ""))
										  )
										: "Select amount"}
								</Text>
								<Text className="text-gray-400">⌄</Text>
							</TouchableOpacity>
							{touched.spendRange && errors.spendRange && (
								<Text className="text-red-500 text-sm mt-1">
									{errors.spendRange}
								</Text>
							)}
						</View>

						<View className="mb-4">
							<View className="flex-row items-center justify-between mb-2">
								<Text className="text-base font-medium text-gray-800">
									Estimated calories per order
								</Text>
							</View>
							<TouchableOpacity
								className={`w-full border rounded-lg p-3 flex-row justify-between items-center ${
									touched.calories && errors.calories
										? "border-red-500"
										: "border-gray-200"
								}`}
								onPress={() => {
									handleOpenCaloriesPicker();
									handleTouch("calories");
								}}>
								<Text className={calories ? "text-gray-900" : "text-gray-400"}>
									{calories || "Enter calories"}
								</Text>
								<Text className="text-blue-400">Adjust</Text>
							</TouchableOpacity>
							{touched.calories && errors.calories && (
								<Text className="text-red-500 text-sm mt-1">{errors.calories}</Text>
							)}
						</View>

						{/* Calories Picker Modal */}
						<Modal
							visible={showCaloriesPicker}
							transparent
							animationType="slide">
							<View className="flex-1 justify-end bg-black/50">
								<View className="bg-white rounded-t-3xl">
									<View className="flex-row justify-between items-center p-4 border-b border-gray-200">
										<TouchableOpacity
											onPress={() => setShowCaloriesPicker(false)}>
											<Text className="text-gray-500">Cancel</Text>
										</TouchableOpacity>
										<Text className="text-lg font-medium">Enter Calories</Text>
										<TouchableOpacity onPress={handleCaloriesDone}>
											<Text className="text-blue-500 font-medium">Done</Text>
										</TouchableOpacity>
									</View>
									<View className="p-4">
										<TextInput
											className="text-gray-900 text-center text-lg p-2 border border-gray-200 rounded-lg"
											keyboardType="numeric"
											value={tempCalories}
											onChangeText={(text) => {
												// Only allow numbers and empty string
												if (text === "" || /^\d+$/.test(text)) {
													setTempCalories(text);
												}
											}}
											placeholder="Enter calories"
											placeholderTextColor="#9CA3AF"
										/>
										<View className="mt-4">
											<Text className="text-sm text-gray-500 text-center">
												Common takeout meals range from 800-1500 calories
											</Text>
											<View className="flex-row justify-center mt-2 space-x-2">
												{["800", "1000", "1200", "1500"].map((preset) => (
													<TouchableOpacity
														key={preset}
														className="bg-gray-100 px-3 py-1 rounded"
														onPress={() => setTempCalories(preset)}>
														<Text className="text-gray-700">{preset}</Text>
													</TouchableOpacity>
												))}
											</View>
										</View>
									</View>
								</View>
							</View>
						</Modal>

						<View className="mt-8 bg-blue-50 p-4 rounded-lg">
							<Text className="text-md font-medium text-blue-900 mb-4 text-center">
								Based on your inputs:
							</Text>
							<View className="space-y-2">
								<Text className="text-sm text-gray-600 text-center">
									Weekly orders: {frequency?.split(" ")[0]} times
								</Text>
								<Text className="text-sm text-gray-600 text-center">
									Monthly spending: {currencyInfo.symbol}
									{monthlyStats.spend.toFixed(2)}
								</Text>
								<Text className="text-sm text-gray-600 text-center">
									Monthly calories: {monthlyStats.calories.toLocaleString()} cal
								</Text>
							</View>
						</View>
					</View>
				</ScrollView>

				<View className="w-full p-6 mt-auto">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							frequency && spendRange && calories ? "bg-blue-950" : "bg-gray-200"
						}`}
						onPress={handleNext}>
						<Text
							className={`text-center font-medium ${
								frequency && spendRange && calories
									? "text-white"
									: "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>

				<Modal
					visible={showFrequencyPicker}
					transparent
					animationType="slide"
					onRequestClose={() => setShowFrequencyPicker(false)}>
					<Pressable
						className="flex-1 bg-black/50"
						onPress={() => setShowFrequencyPicker(false)}>
						<View className="flex-1" />
						<View className="bg-white rounded-t-3xl">
							<View className="flex-row justify-between items-center p-4 border-b border-gray-100">
								<Text className="text-lg font-medium">Select Frequency</Text>
								<TouchableOpacity onPress={() => setShowFrequencyPicker(false)}>
									<Text className="text-blue-500">Done</Text>
								</TouchableOpacity>
							</View>
							<ScrollView className="max-h-80">
								{FREQUENCY_OPTIONS.map((option) => (
									<TouchableOpacity
										key={option}
										className={`p-4 border-b border-gray-100 ${
											frequency === option ? "bg-blue-50" : ""
										}`}
										onPress={() => {
											setFrequency(option);
											setShowFrequencyPicker(false);
										}}>
										<Text
											className={`text-base ${
												frequency === option
													? "text-blue-500 font-medium"
													: "text-gray-700"
											}`}>
											{option}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					</Pressable>
				</Modal>

				<ActionSheet
					visible={showSpendPicker}
					onClose={() => setShowSpendPicker(false)}
					title="Select average spend"
					options={spendRangeOptions}
					onSelect={(option: SpendRangeOption) => {
						setSpendRange(option.value);
						setShowSpendPicker(false);
					}}
				/>
			</View>
		</>
	);
};

export default TakeoutHabitsScreen;
