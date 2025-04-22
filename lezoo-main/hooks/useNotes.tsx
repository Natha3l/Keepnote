import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";

const NOTES_STORAGE_KEY = "cached_notes";

export type Note = {
  id: number;
  title: string;
  content: string;
  categories: { id: number; name: string; color: string }[];
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { userToken } = useAuth();
  const { categories } = useCategories();

  const fetchNotes = async () => {
    if (!userToken) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const cached = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }

      const response = await apiRequest("/notes", "GET", undefined, userToken);
      const data = response?.data ?? response;

      if (Array.isArray(data)) {
        const notesWithCategories = data.map((note: any) => {
          const noteCategories = categories.filter(cat =>
            note.category_ids?.includes(cat.id)
          );
          return { ...note, categories: noteCategories };
        });

        setNotes(notesWithCategories);
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesWithCategories));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notes.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (note: {
    title: string;
    content: string;
    category_ids?: number[];
  }) => {
    if (!userToken) throw new Error("Utilisateur non authentifié");

    if (!note.title || !note.content) {
      throw new Error("Le titre et le contenu sont obligatoires.");
    }

    try {
      const response = await apiRequest("/notes", "POST", note, userToken);
      const createdNote = response?.data ?? response;
      const noteId = createdNote?.id;

      if (!noteId) throw new Error("Création échouée : ID manquant");

      const noteCategories = categories.filter(cat =>
        note.category_ids?.includes(cat.id)
      );

      const fullNote = { ...createdNote, categories: noteCategories };

      setNotes(prev => [fullNote, ...prev]);

      try {
        const cacheStr = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
        const cachedNotes = cacheStr ? JSON.parse(cacheStr) : [];
        const notesToCache = Array.isArray(cachedNotes) ? [fullNote, ...cachedNotes] : [fullNote];
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesToCache));
      } catch (cacheErr) {
        console.warn("Erreur lors de la mise en cache des notes");
      }

      return fullNote;
    } catch (error) {
      console.error("Erreur lors de la création d'une note.");
      throw new Error("Impossible de créer la note.");
    }
  };

  const updateNote = async (id: number, note: {
    title: string;
    content: string;
    category_ids?: number[];
  }) => {
    if (!userToken) throw new Error("Utilisateur non authentifié");

    if (!note.title || !note.content) {
      throw new Error("Le titre et le contenu sont requis pour la mise à jour.");
    }

    try {
      const response = await apiRequest(`/notes/${id}`, "PUT", note, userToken);
      const updated = response?.data ?? response;

      const updatedNote = {
        ...updated,
        categories: categories.filter(cat =>
          note.category_ids?.includes(cat.id)
        ),
      };

      setNotes(prev => prev.map(n => (n.id === id ? updatedNote : n)));

      const cachedNotesStr = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (cachedNotesStr) {
        const parsed = JSON.parse(cachedNotesStr);
        if (Array.isArray(parsed)) {
          const updatedCache = parsed.map((n: Note) => (n.id === id ? updatedNote : n));
          await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCache));
        }
      }

      return updatedNote;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note.");
      throw new Error("Impossible de mettre à jour la note.");
    }
  };

  const deleteNote = async (id: number) => {
    if (!userToken) throw new Error("Utilisateur non authentifié");

    try {
      await apiRequest(`/notes/${id}`, "DELETE", undefined, userToken);

      setNotes(prev => prev.filter(n => n.id !== id));

      const cachedNotesStr = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (cachedNotesStr) {
        const parsed = JSON.parse(cachedNotesStr);
        if (Array.isArray(parsed)) {
          const updatedCache = parsed.filter((n: Note) => n.id !== id);
          await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedCache));
        }
      }

    } catch (error) {
      console.error("Erreur lors de la suppression de la note.");
      throw new Error("Impossible de supprimer la note.");
    }
  };

  useEffect(() => {
    if (userToken && categories.length > 0) {
      fetchNotes();
    }
  }, [userToken, categories]);

  return { notes, loading, fetchNotes, createNote, updateNote, deleteNote };
}
