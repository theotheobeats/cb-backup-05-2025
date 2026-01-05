import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorScreenProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
    message,
    onRetry 
}) => {
    return (
        <View className="flex-1 justify-center items-center px-4 bg-white">
            <Text className="text-xl text-red-500 mb-2">Oops!</Text>
            <Text className="text-center text-gray-600 mb-4">{message}</Text>
            {onRetry && (
                <TouchableOpacity 
                    className="bg-blue-500 px-6 py-3 rounded-lg"
                    onPress={onRetry}>
                    <Text className="text-white font-semibold">Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}; 