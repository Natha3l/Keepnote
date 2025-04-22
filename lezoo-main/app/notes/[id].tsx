import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, TextInput, TouchableOpacity, Text, Alert, ScrollView } from "react-native";
import { useNotes } from "@/hooks/useNotes";
import { useCategories } from "@/hooks/useCategories";
import CategoryPicker from "@/components/categories/CategoryPicker";
import tw from "twrnc";

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote, deleteNote, loading } = useNotes();
  const { categories, fetchCategories } = useCategories();
  const router = useRouter();

  const note = notes.find((n) => n.id === Number(id));
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    note?.categories?.map((c) => c.id) || []
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!note) {
      router.replace("/explore");
    }
  }, [note]);

  const handleToggleCategory = (catId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSave = async () => {
    if (!title || !content) {
      Alert.alert("Erreur", "Le titre et le contenu sont obligatoires");
      return;
    }

    try {
      await updateNote(Number(id), {
        title,
        content,
        category_ids: selectedCategories,
      });
      router.replace(`/notes/${id}`);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la note:", err);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement de la note");
    }
  };

  const handleDelete = () => {
    Alert.alert("Supprimer", "Voulez-vous supprimer cette note ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(Number(id));
            router.replace("/explore");
          } catch (err) {
            console.error("Erreur lors de la suppression de la note:", err);
            Alert.alert("Erreur", "Une erreur est survenue lors de la suppression de la note");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white dark:bg-black`} contentContainerStyle={tw`p-4`}>
      <TextInput
        placeholder="Titre de la note"
        style={tw`border-b border-gray-300 dark:border-gray-700 mb-4 p-2 text-black dark:text-white`}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Contenu de la note"
        style={tw`border-b border-gray-300 dark:border-gray-700 mb-4 p-2 text-black dark:text-white`}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Text style={tw`text-black dark:text-white font-bold mb-2`}>Catégories :</Text>
      <CategoryPicker
        categories={categories}
        selectedIds={selectedCategories}
        onToggle={handleToggleCategory}
      />

      <TouchableOpacity onPress={handleSave} style={tw`bg-blue-500 p-4 rounded-lg mb-4`}>
        <Text style={tw`text-white text-center font-bold`}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} style={tw`bg-red-500 p-4 rounded-lg`}>
        <Text style={tw`text-white text-center font-bold`}>Supprimer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
