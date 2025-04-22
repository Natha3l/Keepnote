import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export type Category = {
  id: number;
  name: string;
  color: string;
};

const CATEGORIES_STORAGE_KEY = "cached_categories";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useAuth();

  const fetchCategories = async () => {
    if (!userToken) return;

    try {
      const cached = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setCategories(parsed);
      }

      const res = await apiRequest("/categories", "GET", undefined, userToken);
      const data = res.data ?? res;

      if (Array.isArray(data)) {
        setCategories(data);
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Erreur lors du fetch des catégories", error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, color: string) => {
    if (!userToken) throw new Error("Non connecté");

    const res = await apiRequest("/categories", "POST", { name, color }, userToken);
    const newCat = res.data ?? res;

    setCategories(prev => [newCat, ...prev]);
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify([newCat, ...categories]));

    return newCat;
  };

  const deleteCategory = async (id: number) => {
    if (!userToken) throw new Error("Non connecté");

    await apiRequest(`/categories/${id}`, "DELETE", undefined, userToken);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    if (userToken) fetchCategories();
  }, [userToken]);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    deleteCategory,
  };
}
