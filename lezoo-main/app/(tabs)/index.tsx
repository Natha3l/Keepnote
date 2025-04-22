import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useAuth } from "../_layout";
import { useNotes } from "@/hooks/useNotes";
import { useCategories } from "@/hooks/useCategories";
import NoteList from "@/components/notes/NoteList";
import tw from "twrnc";

export default function Index() {
  const { user, userToken, signOut } = useAuth();
  const { notes, loading, fetchNotes, deleteNote } = useNotes();
  const { categories, fetchCategories } = useCategories();
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await fetchNotes();
          await fetchCategories();
        } catch (e) {
          setError("Impossible de charger les données.");
        }
      })();
    }, [])
  );

  const filteredNotes =
    selectedCategoryId && Array.isArray(notes)
      ? notes.filter((note) =>
          note.categories?.some((c) => c.id === selectedCategoryId)
        )
      : notes;

  const toggleCategory = (id: number) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={tw`flex-1`}>
      <Text style={tw`text-2xl font-bold p-4 text-black dark:text-white`}>
        Notes
      </Text>

      {user && (
        <Text style={tw`text-lg px-4 text-black dark:text-white`}>
          Bienvenue, {user.name} !
        </Text>
      )}

      {userToken && (
        <View style={tw`flex-row p-4`}>
          <TouchableOpacity
            onPress={signOut}
            style={tw`bg-red-500 p-2 rounded-lg`}
          >
            <Text style={tw`text-white`}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.push("/notes/create" as any)}
        style={tw`bg-blue-500 p-4 rounded-lg my-2 mx-4`}
      >
        <Text style={tw`text-white text-center font-bold`}>Créer une note</Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4 pb-2`}
      >
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={tw`mr-2 px-2 py-1 rounded-full border ${
                  isActive
                    ? "bg-blue-500 border-blue-600"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <View style={tw`flex-row items-center`}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: cat.color,
                      marginRight: 4,
                    }}
                  />
                  <Text
                    style={tw`${isActive ? "text-white" : "text-black"} text-xs`}
                  >
                    {cat.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={tw`px-4 text-gray-400`}>Aucune catégorie</Text>
        )}
      </ScrollView>

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View style={tw`p-4`}>
          <Text style={tw`text-red-500 text-center`}>{error}</Text>
        </View>
      ) : Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
          <NoteList notes={filteredNotes} onDeleteNote={deleteNote} />
        </ScrollView>
      ) : (
        <View style={tw`p-4`}>
          <Text style={tw`text-gray-500 text-center`}>Aucune note à afficher.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
