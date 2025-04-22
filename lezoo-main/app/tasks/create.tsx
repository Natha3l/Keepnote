import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useTasks } from "@/hooks/useTasks";
import { useNotes } from "@/hooks/useNotes";
import { useRouter } from "expo-router";
import tw from "twrnc";

export default function CreateTaskScreen() {
  const { createTask } = useTasks();
  const { notes, fetchNotes } = useNotes();
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([""]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddSubtask = () => setSubtasks([...subtasks, ""]);

  const handleSubtaskChange = (text: string, index: number) => {
    const updated = [...subtasks];
    updated[index] = text;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (index: number) => {
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert("Erreur", "La description de la tâche est obligatoire.");
      return;
    }
  
    const cleanSubtasksArray = Array.isArray(subtasks)
      ? subtasks
          .map((desc) => (typeof desc === "string" ? desc.trim() : ""))
          .filter((desc) => desc.length > 0)
          .map((desc) => ({ description: desc }))
      : [];
  
    try {
      await createTask({
        description,
        ...(selectedNoteId ? { note_id: selectedNoteId } : {}),
        ...(cleanSubtasksArray.length > 0 ? { subtasks: cleanSubtasksArray } : {}),
      });
      router.back();
    } catch (err) {
      console.error("Erreur lors de la création de tâche :", err);
      Alert.alert("Erreur", "Impossible de créer la tâche.");
    }
  };
  

  return (
    <ScrollView style={tw`flex-1 bg-white dark:bg-black`} contentContainerStyle={tw`p-4`}>
      <TextInput
        placeholder="Description de la tâche"
        placeholderTextColor="#999"
        style={tw`border-b border-gray-300 dark:border-gray-700 mb-4 p-2 text-black dark:text-white`}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={tw`text-black dark:text-white font-bold mb-2`}>Sous-tâches :</Text>
      {subtasks.map((sub, index) => (
        <View key={index} style={tw`flex-row items-center mb-2`}>
          <TextInput
            placeholder={`Sous-tâche ${index + 1}`}
            value={sub}
            onChangeText={(text) => handleSubtaskChange(text, index)}
            style={tw`flex-1 border-b border-gray-300 dark:border-gray-700 p-2 text-black dark:text-white`}
          />
          <TouchableOpacity onPress={() => handleRemoveSubtask(index)} style={tw`ml-2`}>
            <Text style={tw`text-red-500`}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={handleAddSubtask} style={tw`mb-4`}>
        <Text style={tw`text-blue-500`}>+ Ajouter une sous-tâche</Text>
      </TouchableOpacity>

      <Text style={tw`text-black dark:text-white font-bold mb-2`}>Associer à une note :</Text>
      {notes.map((note) => (
        <TouchableOpacity
          key={note.id}
          onPress={() => setSelectedNoteId(note.id === selectedNoteId ? null : note.id)}
          style={tw`p-2 mb-2 rounded-lg ${note.id === selectedNoteId ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`}
        >
          <Text style={tw`${note.id === selectedNoteId ? "text-white" : "text-black dark:text-white"}`}>
            {note.title}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={handleSave} style={tw`bg-green-500 p-4 rounded-lg mt-4`}>
        <Text style={tw`text-white text-center font-bold`}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
