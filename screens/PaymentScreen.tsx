import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  NativeModules,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import ProgressBar from "../components/ProgressBar";
import useOnboardingProgress from "../hooks/useOnboardingProgress";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "../context/AppContext";
import { COUNTRY_CODES } from "@/constants";

const LoadingOverlay = () => (
  <Modal transparent visible={true}>
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <View className="bg-white p-6 rounded-2xl items-center">
        <ActivityIndicator size="large" color="#1E2C8C" />
        <Text className="text-gray-700 font-medium mt-4 text-center">
          Creating your account...{"\n"}
          Please wait
        </Text>
      </View>
    </View>
  </Modal>
);

const PaymentScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const progress = useOnboardingProgress();
  const { onboardingData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState({
    monthly: { amount: 3.99, currency: "GBP", symbol: "£" },
    annual: { amount: 35.99, currency: "GBP", symbol: "£" },
  });
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  console.log(onboardingData.email, onboardingData.password);

  // Get prices based on user's location from onboardingData
  useEffect(() => {
    const getLocalizedPrices = async () => {
      try {
        setIsLoadingPrices(true);
        const countryCode = COUNTRY_CODES[onboardingData.location] || "GB";

        // Get currency information based on country code
        const response = await axios.get(
          `https://restcountries.com/v3.1/alpha/${countryCode}`
        );

        if (response.data && response.data[0]?.currencies) {
          const currencyCode = Object.keys(response.data[0].currencies)[0];
          const currencySymbol =
            response.data[0].currencies[currencyCode].symbol;

          // Get exchange rate from GBP to local currency
          const exchangeResponse = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/GBP`
          );

          if (exchangeResponse.data?.rates?.[currencyCode]) {
            const rate = exchangeResponse.data.rates[currencyCode];
            setPrices({
              monthly: {
                amount: Number((3.99 * rate).toFixed(2)),
                currency: currencyCode,
                symbol: currencySymbol,
              },
              annual: {
                amount: Number((35.99 * rate).toFixed(2)),
                currency: currencyCode,
                symbol: currencySymbol,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error fetching localized prices:", error);
        // Fallback to default GBP prices if there's an error
      } finally {
        setIsLoadingPrices(false);
      }
    };

    getLocalizedPrices();
  }, [onboardingData.location]);

  const handleSignUp = async (planType: "monthly" | "annual") => {
    if (!onboardingData.email || !onboardingData.password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    setIsLoading(true);

    //for testing purposes
    await AsyncStorage.clear();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/sign-up/email",
        {
          email: onboardingData.email,
          password: onboardingData.password,
          name: onboardingData.name,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );
      if (response.status === 200) {
        console.log("API Response:", response.data);
        console.log("User token:", response.data.token);
        console.log("User email:", onboardingData.email);
        console.log("User data from onboarding:", onboardingData);

        // Store the auth token
        await AsyncStorage.setItem("userToken", response.data.token);
        await AsyncStorage.setItem("userEmail", onboardingData.email);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({ userData: onboardingData })
        );

        const userData = await axios.post(
          "http://localhost:3000/api/onboarding",
          { onboardingData },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${response.data.token}`,
            },
          }
        );

        if (userData.status === 200) {
          console.log("User data:", userData.data);
          const asyncStorage = await AsyncStorage.getItem("userData");
          console.log("User data from async storage:", asyncStorage);
          navigation.replace("MainApp");
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      if (axios.isAxiosError(error)) {
        await AsyncStorage.clear();
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        Alert.alert(
          "Sign Up Failed",
          `Error: ${
            error.response?.data?.message ||
            error.message ||
            "Failed to create account"
          }\n\nPlease check your connection and try again.`
        );
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PlanCard = ({
    title,
    price,
    period,
    description,
    buttonText,
    isAnnual = false,
  }: {
    title: string;
    price: string;
    period: string;
    description: string;
    buttonText: string;
    isAnnual?: boolean;
  }) => (
    <View className="border border-blue-900 rounded-2xl p-6 mb-4 bg-blue-50">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-blue-900 text-lg font-medium">{title}</Text>
        <View className="flex-row items-baseline">
          {isLoadingPrices ? (
            <ActivityIndicator size="small" color="#1E40AF" />
          ) : (
            <>
              <Text className="text-blue-900 text-2xl font-bold">
                {isAnnual
                  ? `${prices.annual.symbol}${prices.annual.amount}`
                  : `${prices.monthly.symbol}${prices.monthly.amount}`}
              </Text>
              <Text className="text-blue-900 text-base">/{period}</Text>
            </>
          )}
        </View>
      </View>
      <Text className="text-gray-600 mb-4">{description}</Text>
      <TouchableOpacity
        onPress={() => handleSignUp(isAnnual ? "annual" : "monthly")}
        disabled={isLoading || isLoadingPrices}
        className={`rounded-lg py-3 ${
          isAnnual ? "bg-blue-500" : "bg-blue-950"
        } ${isLoading || isLoadingPrices ? "opacity-50" : ""}`}
      >
        <Text className="text-white text-center font-medium">
          {isLoading ? "Creating Account..." : buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <ProgressBar progress={progress} />
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1 px-8 pt-6">
          <Text className="text-blue-900 text-3xl font-bold mb-8 text-center mt-20">
            Choose Your Plan
          </Text>

          <PlanCard
            title="Monthly Plan"
            price={`${prices.monthly.symbol}${prices.monthly.amount}`}
            period="month"
            description="Perfect for trying out CraveBlock"
            buttonText="Start Monthly Plan"
          />

          <PlanCard
            title="Annual Plan"
            price={`${prices.annual.symbol}${prices.annual.amount}`}
            period="year"
            description="Save 25% compared to monthly"
            buttonText="Start Annual Plan"
            isAnnual
          />

          <Text className="text-gray-600 text-center mb-6">
            Try free for 7 days
          </Text>
        </ScrollView>

        <View className="px-8 pb-6">
          <TouchableOpacity
            onPress={() => handleSignUp("monthly")}
            disabled={isLoading || isLoadingPrices}
            className={`bg-blue-950 rounded-lg py-4 mt-4 ${
              isLoading || isLoadingPrices ? "opacity-50" : ""
            }`}
          >
            <View className="flex-row justify-center items-center">
              <Text className="text-white font-medium mr-2">
                {isLoading ? "Creating Account..." : "Join CraveBlock Now"}
              </Text>
              <Text className="text-white">→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && <LoadingOverlay />}
    </>
  );
};

export default PaymentScreen;
