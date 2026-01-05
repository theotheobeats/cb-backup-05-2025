import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { useApp } from "../context/AppContext";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

const ThreeMonthsOutlookScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { createThreeMonthsOutlook } = useApp();
	const progress = useOnboardingProgress();
	const { onboardingData } = useApp();

	// Helper function to format currency based on location
	const formatCurrency = (amount: number) => {
		const location = onboardingData.location?.toLowerCase() || 'us';
		console.log("location: ", location);
		const currencyMap: { [key: string]: string } = {
			'united states': '$',
			'united kingdom': '£',
			'european union': '€',
			'japan': '¥',
			'china': '¥',
			'south korea': '₩',
			'korea': '₩',
			'india': '₹',
			'russia': '₽',
			'brazil': 'R$',
			'australia': 'A$',
			'canada': 'C$',
			'switzerland': 'CHF',
			'new zealand': 'NZ$',
			'singapore': 'S$',
			'hong kong': 'HK$',
			'sweden': 'kr',
			'norway': 'kr',
			'denmark': 'kr',
			'south africa': 'R',
			'mexico': 'Mex$',
			'united arab emirates': 'د.إ',
			'uae': 'د.إ',
			'saudi arabia': '﷼',
			'israel': '₪',
			'thailand': '฿',
			'vietnam': '₫',
			'philippines': '₱',
			'malaysia': 'RM',
			'indonesia': 'Rp',
			'turkey': '₺',
			'poland': 'zł',
			// Common variations
			'america': '$',
			'usa': '$',
			'uk': '£',
			'great britain': '£',
			'england': '£',
			'europe': '€',
			'emirates': 'د.إ'
		};
		
		// First try exact match
		const exactMatch = Object.entries(currencyMap).find(([key]) => 
			location === key || location.startsWith(key + ' ')
		);

		// If no exact match, try partial match with more sophisticated matching
		const partialMatch = Object.entries(currencyMap).find(([key]) => 
			location.includes(key) || key.includes(location)
		);

		const currencySymbol = (exactMatch || partialMatch)?.[1] || '$';
		
		// Format number with appropriate thousands separator and decimal places
		return `${currencySymbol}${amount.toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}`;
	};

	const ProjectionItem = ({
		emoji,
		value,
		description,
		type
	}: {
		emoji: string;
		value: string | number;
		description: string;
		type?: 'currency' | 'weight' | 'calories';
	}) => {
		let displayValue = value;

		if (type === 'currency') {
			displayValue = formatCurrency(Number(value));
		} else if (type === 'weight') {
			const lbs = Number(value);
			const kg = (lbs * 0.45359237).toFixed(1);
			displayValue = `${lbs.toLocaleString(undefined, { maximumFractionDigits: 1 })} lbs (${kg} kg)`;
		} else if (type === 'calories') {
			displayValue = `${Number(value).toLocaleString()} Calories`;
		}

		return (
			<View className="py-8 border-b border-gray-100 text-center shadow-sm mb-4">
				<Text className="text-2xl text-center mb-2">{emoji}</Text>
				<Text className="text-3xl text-center font-bold mb-1">{displayValue}</Text>
				<Text className="text-gray-600 text-center text-sm">{description} avoided</Text>
			</View>
		);
	};

	const projections = createThreeMonthsOutlook(onboardingData.monthlyStats).totals;

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-slate-50">
				<ScrollView className="flex-1 px-8">
					<Text className="text-2xl font-bold text-center mt-8 mb-12">
						In Just 3 Months, You Could...
					</Text>

					<View className="space-y-4">
						<ProjectionItem
							emoji="💰"
							value={projections.totalMoneySaved}
							description="Less wasted money on takeout"
							type="currency"
						/>

						<ProjectionItem
							emoji="🔥"
							value={projections.totalCaloriesReduced}
							description="That's serious fuel you skipped"
							type="calories"
						/>

						<ProjectionItem
							emoji="⚖️"
							value={projections.totalWeightLossLbs}
							description="Momentum, not regret"
							type="weight"
						/>
					</View>

					<Text className="text-xs text-gray-500 text-center mt-8 mb-4">
						Based on your current habits and CraveBlock's average impact
					</Text>
				</ScrollView>

				<View className="p-6 border-t border-gray-100">
					<TouchableOpacity
						className="w-full p-4 rounded-xl bg-blue-950"
						onPress={() => navigation.navigate("PaymentScreen")}>
						<Text className="text-center font-medium text-white">
							Let's Lock This In
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
};

export default ThreeMonthsOutlookScreen;
