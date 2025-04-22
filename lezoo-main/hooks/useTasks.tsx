import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const TASKS_STORAGE_KEY = "cached_tasks";

export type SubTask = {
  id: number;
  description: string;
  completed: boolean;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  note?: any;
  note_id?: number | null;
  subtasks?: SubTask[];
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useAuth();

  const normalizeTask = (t: any): Task => ({
    id: t.id,
    title: t.title ?? "",
    description: t.description ?? "",
    completed: t.completed ?? false,
    note: t.note ?? null,
    note_id: t.note_id ?? null,
    subtasks: Array.isArray(t.subtasks)
      ? t.subtasks.map((s: any) => ({
          id: s.id,
          description: s.description ?? "",
          completed: s.completed ?? false,
        }))
      : [],
  });

  const fetchTasks = async () => {
    if (!userToken) return;

    try {
      const data = await apiRequest("/tasks", "GET", undefined, userToken);
      const parsed = Array.isArray(data) ? data.map(normalizeTask) : [];
      setTasks(parsed);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(parsed));
    } catch (err) {
      console.error("Erreur fetchTasks:", (err as Error).message);
      try {
        const cached = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (cached) setTasks(JSON.parse(cached));
      } catch {
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data: {
    title?: string;
    description: string;
    note_id?: number;
    subtasks?: { description: string }[];
  }) => {
    if (!userToken) throw new Error("Utilisateur non authentifié");

    const bodyToSend: any = {
      title: data.title ?? "Sans titre",
      description: data.description,
    };

    if (typeof data.note_id === "number") {
      bodyToSend.note_id = data.note_id;
    }

    if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
      bodyToSend.subtasks = data.subtasks;
    }

    const res = await apiRequest("/tasks", "POST", bodyToSend, userToken);
    const newTask = normalizeTask(res);

    setTasks((prev) => [newTask, ...prev]);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([newTask, ...tasks]));

    return newTask;
  };

  const updateTask = async (id: number, task: Partial<Task>) => {
    if (!userToken) throw new Error("Non authentifié");

    try {
      const response = await apiRequest(`/tasks/${id}`, "PUT", task, userToken);
      const updated = normalizeTask(response);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Erreur updateTask:", (err as Error).message);
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    if (!userToken) throw new Error("Non authentifié");

    try {
      await apiRequest(`/tasks/${id}`, "DELETE", undefined, userToken);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Erreur deleteTask:", (err as Error).message);
      throw err;
    }
  };

  useEffect(() => {
    if (userToken) fetchTasks();
  }, [userToken]);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
