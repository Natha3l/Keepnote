import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTasks } from "@/hooks/useTasks";
import TaskList from "@/components/tasks/TaskList";
import { useRouter } from "expo-router";

export default function TasksScreen() {
  const { tasks, deleteTask } = useTasks();
  const router = useRouter();

  const handleAdd = () => {
    router.push("/tasks/create");
  };

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>
        Tâches
      </Text>

      <TouchableOpacity
        onPress={handleAdd}
        style={{
          backgroundColor: "#007bff",
          padding: 12,
          borderRadius: 8,
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Ajouter une tâche</Text>
      </TouchableOpacity>

      <ScrollView>
        <TaskList tasks={tasks} onDeleteTask={deleteTask} />
      </ScrollView>
    </View>
  );
}
