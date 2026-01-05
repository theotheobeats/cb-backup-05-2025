import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type RootStackParamList = {
	OnboardingWelcome: undefined;
	BasicInfo: undefined;
	TakeoutHabits: undefined;
	CravingPatterns: undefined;
	AppSelection: undefined;
	BlockingPlan: undefined;
	BlockingPlanManual: undefined;
	MainApp: undefined;
	EmotionalCheckIn: undefined;
	HowDoYouFeel: undefined;
	Goal: undefined;
	EmotionalAnchor: undefined;
	HealthyRelationship: undefined;
	Concern: undefined;
	Motivation: undefined;
	CravingPattern: undefined;
	ThreeMonthsOutlook: undefined;
	PaymentScreen: undefined;
	CravingHistory: undefined;
	Login: undefined;
};

export type TabParamList = {
	Dashboard: undefined;
	Progress: undefined;
	Settings: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
export type TabNavigationProps = BottomTabNavigationProp<TabParamList>;
