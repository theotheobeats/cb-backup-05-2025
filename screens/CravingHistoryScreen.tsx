import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useCravingLogs } from '@/hooks/useCravingLogs';
import { format } from 'date-fns';
import { CravingLog } from '@/types/models';

export const CravingHistoryScreen: React.FC = () => {
  const { logs } = useCravingLogs();

  const renderLogItem = ({ item }: { item: CravingLog }) => {
    const date = new Date(item.timestamp);
    const formattedDate = format(date, 'MMM d, yyyy');
    const formattedTime = format(date, 'h:mm a');

    return (
      <View className="bg-white p-4 mb-2 rounded-xl shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-sm text-gray-500">{formattedDate}</Text>
            <Text className="text-sm text-gray-500">{formattedTime}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${
            item.isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Text className={`text-sm ${
              item.isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {item.isSuccess ? 'Blocked' : 'Slipped'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-base font-medium mb-1">
              {item.blockedApp}
            </Text>
            {item.trigger && (
              <Text className="text-sm text-gray-600">
                Trigger: {item.trigger}
              </Text>
            )}
          </View>
          <View className="items-end">
            {item.isSuccess && (
              <>
                <Text className="text-sm text-gray-600">
                  Saved £{item.spendingAvoided}
                </Text>
                <Text className="text-sm text-gray-600">
                  {item.caloriesAvoided} cal avoided
                </Text>
              </>
            )}
          </View>
        </View>

        {item.notes && (
          <Text className="text-sm text-gray-600 mt-2 italic">
            "{item.notes}"
          </Text>
        )}

        <View className="flex-row flex-wrap mt-2 gap-2">
          {item.emotion && (
            <View className="bg-gray-100 px-2 py-1 rounded">
              <Text className="text-xs text-gray-600">
                Feeling: {item.emotion}
              </Text>
            </View>
          )}
          {item.intensity && (
            <View className="bg-gray-100 px-2 py-1 rounded">
              <Text className="text-xs text-gray-600">
                Intensity: {'🔥'.repeat(item.intensity)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-14 pb-4 bg-white">
        <Text className="text-2xl font-bold">Craving History</Text>
        <Text className="text-gray-500">Your journey of resistance and growth</Text>
      </View>

      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={item => item.id}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-center">
              No craving logs yet.{'\n'}Your history will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}; 