import { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, ScrollView } from "react-native";
import { useNotes } from "@/hooks/useNotes";
import { useCategories } from "@/hooks/useCategories";
import { useRouter } from "expo-router";
import tw from "twrnc";
import CategoryPicker from "@/components/categories/CategoryPicker";

export default function CreateNoteScreen() {
  const { createNote, fetchNotes } = useNotes();
  const { categories, fetchCategories } = useCategories();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      await createNote({
        title,
        content,
        category_ids: selectedCategories,
      });
      await fetchNotes();
      router.back();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la note :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-white dark:bg-black`} contentContainerStyle={tw`p-4`}>
      <TextInput
        placeholder="Titre"
        placeholderTextColor="#999"
        style={tw`border-b border-gray-300 dark:border-gray-700 mb-4 p-2 text-black dark:text-white`}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Contenu"
        placeholderTextColor="#999"
        multiline
        style={tw`border-b border-gray-300 dark:border-gray-700 mb-4 p-2 text-black dark:text-white h-40`}
        value={content}
        onChangeText={setContent}
      />

      <Text style={tw`text-black dark:text-white font-bold mb-2`}>Catégories :</Text>
      <CategoryPicker
        categories={categories}
        selectedIds={selectedCategories}
        onToggle={handleToggleCategory}
      />

      <TouchableOpacity onPress={handleSave} style={tw`bg-green-500 p-4 rounded-lg mt-4`}>
        <Text style={tw`text-white text-center font-bold`}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
