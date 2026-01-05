import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import screens
import { DashboardScreen } from "@/screens/DashboardScreen";
import ProgressScreen from "@/screens/ProgressScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import OnboardingWelcomeScreen from "@/screens/OnboardingWelcomeScreen";
import BasicInfoScreen from "@/screens/BasicInfoScreen";
import TakeoutHabitsScreen from "@/screens/TakeoutHabitsScreen";
import BlockingPlanScreen from "@/screens/BlockingPlanScreen";
import AppSelectionScreen from "@/screens/AppSelectionScreen";
import EmotionalCheckInScreen from "@/screens/EmotionalCheckInScreen";
import ConcernScreen from "@/screens/ConcernScreen";
import MotivationScreen from "@/screens/MotivationScreen";
import CravingPatternScreen from "@/screens/CravingPatternScreen";
import BlockingPlanManualScreen from "@/screens/BlockingPlanManualScreen";
import HowDoYouFeelScreen from "@/screens/HowDoYouFeelScreen";
import ThreeMonthsOutlookScreen from "@/screens/ThreeMonthsOutlookScreen";
import PaymentScreen from "@/screens/PaymentScreen";
import LoginScreen from "@/screens/LoginScreen";
import GoalScreen from "@/screens/GoalScreen";
import EmotionalAnchorScreen from "@/screens/EmotionalAnchorScreen";
import HealthyRelationshipScreen from "@/screens/HealthyRelationshipScreen";

// Define the stack parameter list type
export type RootStackParamList = {
	Login: undefined;
	OnboardingWelcome: undefined;
	BasicInfo: undefined;
	TakeoutHabits: undefined;
	EmotionalCheckIn: undefined;
	HowDoYouFeel: undefined;
	Goal: undefined;
	EmotionalAnchor: undefined;
	HealthyRelationship: undefined;
	Concern: undefined;
	Motivation: undefined;
	ThreeMonthsOutlook: undefined;
	CravingPattern: undefined;
	AppSelection: undefined;
	BlockingPlan: undefined;
	BlockingPlanManual: undefined;
	PaymentScreen: undefined;
	MainApp: undefined;
};

// Define the tab parameter list type
export type TabParamList = {
	Dashboard: undefined;
	Progress: undefined;
	Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopWidth: 1,
					borderTopColor: "#E5E5EA",
					paddingTop: 10,
					paddingBottom: 10,
					height: 80,
				},
				tabBarActiveTintColor: "#4169E1",
				tabBarInactiveTintColor: "#8E8E93",
				tabBarLabelStyle: {
					fontSize: 12,
					marginTop: 2,
					paddingBottom: 14, // Increased bottom margin from 10 to 14
				},
			}}>
			<Tab.Screen
				name="Dashboard"
				component={DashboardScreen}
				options={{
					tabBarLabel: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={24} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Progress"
				component={ProgressScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="bar-chart-outline" size={24} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Settings"
				component={SettingsScreen}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="settings-outline" size={24} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
	);
};

export const AppNavigator = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [userToken, setUserToken] = useState<string | null>(null);

	useEffect(() => {
		// Check for the auth token when the app loads
		const bootstrapAsync = async () => {
			try {
				const token = await AsyncStorage.getItem("userToken");
				setUserToken(token);
			} catch (e) {
				// Handle error
				console.error("Failed to load auth token:", e);
			} finally {
				setIsLoading(false);
			}
		};

		bootstrapAsync();
	}, []);

	if (isLoading) {
		// You might want to show a loading screen here
		return null;
	}

	return (
		<Stack.Navigator>
			{userToken == null ? (
				// No token found, show auth screens
				<>
					<Stack.Screen
						name="Login"
						component={LoginScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="OnboardingWelcome"
						component={OnboardingWelcomeScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="BasicInfo"
						component={BasicInfoScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="TakeoutHabits"
						component={TakeoutHabitsScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="EmotionalCheckIn"
						component={EmotionalCheckInScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="HowDoYouFeel"
						component={HowDoYouFeelScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Goal"
						component={GoalScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="EmotionalAnchor"
						component={EmotionalAnchorScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="HealthyRelationship"
						component={HealthyRelationshipScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Concern"
						component={ConcernScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Motivation"
						component={MotivationScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="AppSelection"
						component={AppSelectionScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="CravingPattern"
						component={CravingPatternScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="BlockingPlan"
						component={BlockingPlanScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="BlockingPlanManual"
						component={BlockingPlanManualScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="ThreeMonthsOutlook"
						component={ThreeMonthsOutlookScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="PaymentScreen"
						component={PaymentScreen}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="MainApp"
						component={MainTabs}
						options={{ headerShown: false }}
					/>
				</>
			) : (
				// User is signed in, show main app
				<Stack.Screen
					name="MainApp"
					component={MainTabs}
					options={{ headerShown: false }}
				/>
			)}
		</Stack.Navigator>
	);
};
