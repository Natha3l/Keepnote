import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Task } from "@/hooks/useTasks";

type Props = {
  tasks: Task[];
  onDeleteTask: (id: number) => void;
};

const TaskList: React.FC<Props> = ({ tasks, onDeleteTask }) => {
  const router = useRouter();

  if (!tasks.length) {
    return <Text style={{ padding: 16 }}>Aucune tâche trouvée.</Text>;
  }

  return (
    <View style={{ padding: 16 }}>
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          onPress={() => router.push(`/tasks/${task.id}`)}
          style={{
            marginBottom: 12,
            backgroundColor: "#eee",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{task.title}</Text>
          <Text style={{ marginTop: 4, color: "#555" }}>{task.description}</Text>

          <TouchableOpacity
            onPress={() => onDeleteTask(task.id)}
            style={{
              backgroundColor: "#ff4d4f",
              marginTop: 10,
              padding: 6,
              borderRadius: 6,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Supprimer</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TaskList;
