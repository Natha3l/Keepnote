import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Category } from "@/hooks/useCategories";

type Props = {
  categories: Category[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export default function CategoryPicker({ categories, selectedIds, onToggle }: Props) {
  return (
    <View style={tw`flex-row flex-wrap gap-2 my-2`}>
      {categories.map(cat => {
        const selected = selectedIds.includes(cat.id);
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onToggle(cat.id)}
            style={tw`px-3 py-1 rounded-full border ${selected ? "bg-blue-500 border-blue-600" : "bg-gray-200 border-gray-400"}`}
          >
            <View style={tw`flex-row items-center gap-2`}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.color }} />
              <Text style={tw`${selected ? "text-white" : "text-black"}`}>{cat.name}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
