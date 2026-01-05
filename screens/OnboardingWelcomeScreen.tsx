import React, { useEffect, useRef } from "react";
import {
	View,
	Text,
	Image,
	Animated,
	Easing,
	ImageSourcePropType,
	TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";

interface FloatingIconProps {
	source: ImageSourcePropType;
	delay?: number;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ source, delay = 0 }) => {
	const floatAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const floatAnimation = Animated.loop(
			Animated.sequence([
				Animated.timing(floatAnim, {
					toValue: 1,
					duration: 2000,
					delay,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				}),
				Animated.timing(floatAnim, {
					toValue: 0,
					duration: 2000,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				}),
			])
		);

		floatAnimation.start();

		return () => floatAnimation.stop();
	}, [floatAnim, delay]);

	const translateY = floatAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, -10],
	});

	return (
		<Animated.View
			className="w-24 h-24 flex items-center justify-center m-4"
			style={{ transform: [{ translateY }] }}>
			<Image source={source} className="w-20 h-20" resizeMode="contain" />
		</Animated.View>
	);
};

const OnboardingWelcomeScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const progress = useOnboardingProgress();

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<View className="flex-1 items-center justify-center p-4">
					<View className="flex flex-row flex-wrap justify-between items-center gap-y-8 mb-8 mt-32">
						<FloatingIcon
							source={require("../assets/app-icons/ubereats.png")}
							delay={0}
						/>
						<FloatingIcon
							source={require("../assets/app-icons/deliveroo.png")}
							delay={400}
						/>
						<FloatingIcon
							source={require("../assets/app-icons/doordash.png")}
							delay={800}
						/>
					</View>

					<View className="flex flex-row flex-wrap justify-between items-center gap-y-8 mb-8">
						<FloatingIcon
							source={require("../assets/app-icons/grubhub.png")}
							delay={200}
						/>
						<FloatingIcon
							source={require("../assets/app-icons/postmates.png")}
							delay={600}
						/>
						<FloatingIcon
							source={require("../assets/app-icons/justeat.png")}
							delay={1000}
						/>
					</View>

					<Text className="text-4xl font-bold text-center">
						You're not lazy. You're just stuck in a loop. Let's break it.
					</Text>

					<Text className="text-sm text-gray-500 text-center mt-4 mb-8">
						Craveblock helps you stop ordering out when you said you wouldn't.
						So you can feel better, save more and stay in control.
					</Text>

					<View className="w-full p-2 mt-auto">
						<TouchableOpacity
							className="bg-blue-950 text-white p-4 rounded-xl"
							onPress={() => navigation.navigate("BasicInfo")}>
							<Text className="text-white text-center">Get Started</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</>
	);
};

export default OnboardingWelcomeScreen;
