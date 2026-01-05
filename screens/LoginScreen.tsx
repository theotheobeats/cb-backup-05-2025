import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically make an API call to validate credentials
      const response = await axios.post(
        "http://localhost:3000/api/auth/sign-in/email",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      console.log(data);

      // For now, we'll simulate a successful login
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userEmail", email);

      console.log(await AsyncStorage.getItem("userToken"));

      // Navigate to main app
      navigation.replace("MainApp");
    } catch (error) {
      Alert.alert("Error", "Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate("OnboardingWelcome");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1">
        <View className="flex-1 px-8 pt-16 mt-24">
          {/* Logo and Tagline */}
          <View className="items-center mb-20">
            <Text className="text-[56px] font-bold text-[#1E2C8C] mb-2">
              CraveBlock
            </Text>
            <Text className="text-gray-500">
              Stop ordering out when you said you wouldn't.
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-200 p-3 rounded-lg text-gray-900 bg-white"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="border border-gray-200 p-3 rounded-lg text-gray-900 bg-white"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="bg-[#1E2C8C] py-3 rounded-lg mt-4"
            >
              <View className="flex-row items-center justify-center space-x-2">
                {isLoading && <ActivityIndicator size="small" color="white" />}
                <Text className="text-white text-center font-medium">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity onPress={handleSignUp} className="mt-4">
              <Text className="text-[#1E2C8C] text-center text-sm">
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
