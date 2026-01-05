import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Modal,
	Pressable,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../context/AppContext";
import { NavigationProps } from "../types/navigation";
import useOnboardingProgress from "@/hooks/useOnboardingProgress";
import ProgressBar from "@/components/ProgressBar";
import { COUNTRY_CODES } from "@/constants";

const AGE_RANGES = [
	"17-21",
	"22-25",
	"26-30",
	"31-35",
	"36-40",
	"41-45",
	"46-50",
	"51+",
];

const LOCATIONS = Object.keys(COUNTRY_CODES);

interface FormErrors {
	name?: string;
	email?: string;
	password?: string;
	age?: string;
	location?: string;
}

const BasicInfoScreen = () => {
	const navigation = useNavigation<NavigationProps>();
	const { onboardingData, updateOnboardingData } = useApp();
	const progress = useOnboardingProgress();

	const [name, setName] = useState(onboardingData.name);
	const [age, setAge] = useState(onboardingData.age);
	const [email, setEmail] = useState(onboardingData.email);
	const [location, setLocation] = useState(onboardingData.location);
	const [showAgePicker, setShowAgePicker] = useState(false);
	const [showLocationPicker, setShowLocationPicker] = useState(false);
	const [password, setPassword] = useState(onboardingData.password);
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password: string) => {
		return password.length >= 6;
	};

	const validateForm = () => {
		const newErrors: FormErrors = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		} else if (name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!validateEmail(email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (!validatePassword(password)) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!age) {
			newErrors.age = "Age range is required";
		}

		if (!location) {
			newErrors.location = "Country is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		setTouched({
			name: true,
			email: true,
			password: true,
			age: true,
			location: true,
		});

		if (validateForm()) {
			updateOnboardingData({
				name: name.trim(),
				age,
				email: email.trim(),
				location,
				password,
			});
			navigation.navigate("TakeoutHabits");
		} else {
			Alert.alert(
				"Missing Information",
				"Please fill in all required fields correctly"
			);
		}
	};

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		validateForm();
	};

	const handleAgeSelect = (selectedAge: string) => {
		setAge(selectedAge);
		setShowAgePicker(false);
	};

	const handleLocationSelect = (selectedLocation: string) => {
		setLocation(selectedLocation);
		setShowLocationPicker(false);
	};

	return (
		<>
			<ProgressBar progress={progress} />
			<View className="flex-1 bg-white">
				<ScrollView className="flex-1 p-8">
					<Text className="text-2xl font-bold text-center pb-12 mt-8">
						Tell us about yourself
					</Text>

					<View className="mb-8">
						<Text className="text-sm text-gray-600 mb-1">Name</Text>
						<TextInput
							value={name}
							onChangeText={setName}
							onBlur={() => handleBlur("name")}
							placeholder="Enter your name"
							className={`w-full border rounded-lg p-3 text-base ${
								touched.name && errors.name
									? "border-red-500"
									: "border-gray-200"
							}`}
							placeholderTextColor="#A0AEC0"
						/>
						{touched.name && errors.name && (
							<Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
						)}
					</View>

					<View className="mb-8">
						<Text className="text-sm text-gray-600 mb-1">Email</Text>
						<TextInput
							value={email}
							onChangeText={setEmail}
							onBlur={() => handleBlur("email")}
							placeholder="Enter your email"
							className={`w-full border rounded-lg p-3 text-base ${
								touched.email && errors.email
									? "border-red-500"
									: "border-gray-200"
							}`}
							keyboardType="email-address"
							placeholderTextColor="#A0AEC0"
							autoCapitalize="none"
						/>
						{touched.email && errors.email && (
							<Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
						)}
					</View>

					<View className="mb-8">
						<Text className="text-sm text-gray-600 mb-1">Password</Text>
						<TextInput
							value={password}
							onChangeText={setPassword}
							onBlur={() => handleBlur("password")}
							placeholder="Enter your password"
							className={`w-full border rounded-lg p-3 text-base ${
								touched.password && errors.password
									? "border-red-500"
									: "border-gray-200"
							}`}
							secureTextEntry
							placeholderTextColor="#A0AEC0"
							autoCapitalize="none"
						/>
						{touched.password && errors.password && (
							<Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
						)}
					</View>

					<View className="mb-8">
						<Text className="text-sm text-gray-600 mb-1">Age</Text>
						<TouchableOpacity
							className={`w-full border rounded-lg p-3 flex-row justify-between items-center ${
								touched.age && errors.age ? "border-red-500" : "border-gray-200"
							}`}
							onPress={() => setShowAgePicker(true)}>
							<Text
								className={
									age ? "text-gray-900" : "text-gray-400"
								}>
								{age || "Select Age"}
							</Text>
							<Text>▼</Text>
						</TouchableOpacity>
						{touched.age && errors.age && (
							<Text className="text-red-500 text-sm mt-1">{errors.age}</Text>
						)}
					</View>

					<View className="mb-8">
						<Text className="text-sm text-gray-600 mb-1">Country</Text>
						<TouchableOpacity
							className={`w-full border rounded-lg p-3 flex-row justify-between items-center ${
								touched.location && errors.location
									? "border-red-500"
									: "border-gray-200"
							}`}
							onPress={() => setShowLocationPicker(true)}>
							<Text
								className={
									location ? "text-gray-900" : "text-gray-400"
								}>
								{location || "Select Country"}
							</Text>
							<Text>▼</Text>
						</TouchableOpacity>
						{touched.location && errors.location && (
							<Text className="text-red-500 text-sm mt-1">{errors.location}</Text>
						)}
					</View>
				</ScrollView>

				<View className="w-full p-6 mt-auto">
					<TouchableOpacity
						className={`w-full p-4 rounded-xl ${
							name && email && password && age && location
								? "bg-blue-950"
								: "bg-gray-200"
						}`}
						onPress={handleNext}>
						<Text
							className={`text-center font-medium ${
								name && email && password && age && location
									? "text-white"
									: "text-gray-400"
							}`}>
							Continue
						</Text>
					</TouchableOpacity>
				</View>

				<Modal
					visible={showAgePicker}
					transparent
					animationType="slide"
					onRequestClose={() => setShowAgePicker(false)}>
					<Pressable
						className="flex-1 bg-black/50"
						onPress={() => setShowAgePicker(false)}>
						<View className="flex-1" />
						<View className="bg-white rounded-t-3xl">
							<View className="flex-row justify-between items-center p-4 border-b border-gray-100">
								<Text className="text-lg font-medium">Select Age Range</Text>
								<TouchableOpacity onPress={() => setShowAgePicker(false)}>
									<Text className="text-blue-500">Done</Text>
								</TouchableOpacity>
							</View>
							<ScrollView className="max-h-80">
								{AGE_RANGES.map((range) => (
									<TouchableOpacity
										key={range}
										className={`p-4 border-b border-gray-100 ${
											age === range ? "bg-blue-50" : ""
										}`}
										onPress={() => handleAgeSelect(range)}>
										<Text
											className={`text-base ${
												age === range
													? "text-blue-500 font-medium"
													: "text-gray-700"
											}`}>
											{range}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					</Pressable>
				</Modal>

				<Modal
					visible={showLocationPicker}
					transparent
					animationType="slide"
					onRequestClose={() => setShowLocationPicker(false)}>
					<Pressable
						className="flex-1 bg-black/50"
						onPress={() => setShowLocationPicker(false)}>
						<View className="flex-1" />
						<View className="bg-white rounded-t-3xl">
							<View className="flex-row justify-between items-center p-4 border-b border-gray-100">
								<Text className="text-lg font-medium">Select Country</Text>
								<TouchableOpacity onPress={() => setShowLocationPicker(false)}>
									<Text className="text-blue-500">Done</Text>
								</TouchableOpacity>
							</View>
							<ScrollView className="max-h-80">
								{LOCATIONS.map((country) => (
									<TouchableOpacity
										key={country}
										className={`p-4 border-b border-gray-100 ${
											location === country ? "bg-blue-50" : ""
										}`}
										onPress={() => handleLocationSelect(country)}>
										<Text
											className={`text-base ${
												location === country
													? "text-blue-500 font-medium"
													: "text-gray-700"
											}`}>
											{country}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					</Pressable>
				</Modal>
			</View>
		</>
	);
};

export default BasicInfoScreen;
