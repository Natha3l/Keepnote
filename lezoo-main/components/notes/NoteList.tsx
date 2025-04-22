import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Note } from "@/hooks/useNotes";

type Props = {
  notes: Note[];
  onDeleteNote: (id: number) => void;
};

export default function NoteList({ notes, onDeleteNote }: Props) {
  if (!Array.isArray(notes)) {
    return (
      <View style={tw`p-4`}>
        <Text style={tw`text-red-500`}>Aucune note à afficher.</Text>
      </View>
    );
  }

  return (
    <View style={tw`gap-4`}>
      {notes.map((note) => {
        console.log("note.categories", note.categories); 

        return (
          <View
            key={note.id}
            style={tw`bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-sm`}
          >
            <Text style={tw`text-lg font-bold text-black dark:text-white`}>
              {note.title}
            </Text>
            <Text style={tw`text-gray-600 dark:text-gray-400 mt-1`}>
              {note.content}
            </Text>

         
            {note.categories && note.categories.length > 0 && (
              <View style={tw`flex-row flex-wrap gap-1 mt-3`}>
                {note.categories.map((cat) => (
                  <View
                    key={cat.id}
                    style={tw`flex-row items-center px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600`}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: cat.color || "#000",
                        marginRight: 4,
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={tw`text-[10px] text-gray-900 dark:text-white`}
                    >
                      {cat.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          
            <TouchableOpacity
              onPress={() => {
                try {
                  onDeleteNote(note.id);
                } catch (err: any) {
                  console.error("Erreur lors de la suppression :", err);
                }
              }}
              style={tw`mt-3 self-start bg-red-500 py-1 px-3 rounded-full`}
            >
              <Text style={tw`text-white text-sm font-semibold`}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
