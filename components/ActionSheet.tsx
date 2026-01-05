import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';

interface Option {
    value: string;
    label: string;
}

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: Option[];
    onSelect: (option: Option) => void;
}

const ActionSheet: React.FC<ActionSheetProps> = ({ visible, onClose, title, options, onSelect }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <Pressable
                className="flex-1 bg-black/50"
                onPress={onClose}>
                <View className="flex-1" />
                <View className="bg-white rounded-t-3xl">
                    <View className="flex-row justify-between items-center p-4">
                        <Text className="text-lg font-medium">{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-blue-500">Done</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="max-h-80">
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className="p-4 border-b border-gray-100"
                                onPress={() => onSelect(option)}>
                                <Text className="text-base text-gray-700">
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>
    );
};

export default ActionSheet; 