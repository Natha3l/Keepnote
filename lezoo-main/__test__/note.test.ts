import React from "react";
import { render } from "@testing-library/react-native";
import NoteList from "../components/notes/NoteList";

jest.mock("twrnc", () => ({
  __esModule: true,
  default: () => ({}),
}));

describe("Gestion des notes", () => {
  const mockNote = {
    id: 1,
    title: "Note test",
    content: "Contenu test",
    categories: [{ id: 1, name: "Perso", color: "#ff0000" }]
  };

  it("affiche le titre et le contenu d'une note", () => {
    const element = React.createElement(NoteList, {
      notes: [mockNote],
      onDeleteNote: () => {}
    });
    
    const { getByText } = render(element);
    expect(getByText("Note test")).toBeTruthy();
    expect(getByText("Contenu test")).toBeTruthy();
  });

  it("affiche les catégories associées", () => {
    const element = React.createElement(NoteList, {
      notes: [mockNote],
      onDeleteNote: () => {}
    });
    
    const { getByText } = render(element);
    expect(getByText("Perso")).toBeTruthy();
  });
});