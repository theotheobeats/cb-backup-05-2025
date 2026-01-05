import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
	progress: number; // value between 0 and 100
	showPercentage?: boolean; // optional prop to control percentage display
}

const ProgressBar = ({ progress, showPercentage = true }: ProgressBarProps) => {
	// Ensure progress is between 0 and 100
	const clampedProgress = Math.min(Math.max(progress, 0), 100);

	return (
		<View className="w-full mt-12">
			<View
				style={{ height: 8, backgroundColor: "#E5E7EB" }}
				className="rounded-full overflow-hidden">
				<View
					style={{
						height: "100%",
						width: `${clampedProgress}%`,
						backgroundColor: "#1E3A8A",
					}}
					className="rounded-full"
				/>
			</View>
			{showPercentage && (
				<Text className="text-xs text-center text-gray-600 bg-white">
					{Math.round(clampedProgress)}% Complete
				</Text>
			)}
		</View>
	);
};

export default ProgressBar;
