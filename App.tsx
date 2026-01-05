import React from "react";
import { AppProvider } from "./context/AppContext";
import { AppNavigator } from "./navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<AppProvider>
					<NavigationContainer>
						<AppNavigator />
						<StatusBar style="auto" />
					</NavigationContainer>
				</AppProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
