import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTasks } from "@/hooks/useTasks";
import { useNotes } from "@/hooks/useNotes";
import tw from "twrnc";

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask } = useTasks();
  const { notes, fetchNotes } = useNotes();
  const router = useRouter();

  const task = tasks.find((t) => t.id === Number(id));
  const [description, setDescription] = useState(task?.description || "");
  const [completed, setCompleted] = useState(task?.completed || false);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [noteId, setNoteId] = useState<number | null>(task?.note?.id || null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!task) router.replace("/tasks");
  }, [task]);

  const handleToggleSubtask = (index: number) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const handleSubtaskChange = (text: string, index: number) => {
    const updated = [...subtasks];
    updated[index].description = text;
    setSubtasks(updated);
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now(), description: "", completed: false }]);
  };

  const handleRemoveSubtask = (index: number) => {
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert("Erreur", "La description est obligatoire.");
      return;
    }

    try {
      await updateTask(Number(id), {
        description,
        completed,
        note_id: noteId,
        subtasks,
      });
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Échec de la mise à jour de la tâche.");
    }
  };

  const handleDelete = async () => {
    Alert.alert("Supprimer", "Voulez-vous supprimer cette tâche ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(Number(id));
            router.replace("/tasks");
          } catch (err) {
            Alert.alert("Erreur", "Impossible de supprimer la tâche.");
          }
        },
      },
    ]);
  };

  if (!task) return null;

  return (
    <ScrollView style={tw`flex-1 bg-white dark:bg-black`} contentContainerStyle={tw`p-4`}>
      <TextInput
        placeholder="Description"
        style={tw`border-b border-gray-300 dark:border-gray-700 mb-4 p-2 text-black dark:text-white`}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity onPress={() => setCompleted(!completed)} style={tw`mb-4`}>
        <Text style={tw`text-${completed ? "green" : "gray"}-600`}>
         {completed ? "Tâche complétée" : "Marquer comme complétée"}
        </Text>
      </TouchableOpacity>

      <Text style={tw`text-black dark:text-white font-bold mb-2`}>Sous-tâches :</Text>
      {subtasks.map((sub, index) => (
        <View key={index} style={tw`flex-row items-center mb-2`}>
          <TouchableOpacity
            onPress={() => handleToggleSubtask(index)}
            style={tw`mr-2`}
          >
            <Text style={tw`text-lg`}>
              {sub.completed ? "☑️" : "⬜"}
            </Text>
          </TouchableOpacity>
          <TextInput
            value={sub.description}
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
          onPress={() => setNoteId(note.id === noteId ? null : note.id)}
          style={tw`p-2 mb-2 rounded-lg ${note.id === noteId ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`}
        >
          <Text style={tw`${note.id === noteId ? "text-white" : "text-black dark:text-white"}`}>
            {note.title}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={handleSave} style={tw`bg-blue-500 p-4 rounded-lg mb-4`}>
        <Text style={tw`text-white text-center font-bold`}>Enregistrer</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} style={tw`bg-red-500 p-4 rounded-lg`}>
        <Text style={tw`text-white text-center font-bold`}>Supprimer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
