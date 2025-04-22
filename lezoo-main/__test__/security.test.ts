describe("Validation des entrées utilisateur", () => {
    const isNoteValid = (title: string, content: string) =>
      !!title.trim() && !!content.trim();
  
    it("refuse une note sans titre", () => {
      expect(isNoteValid("", "du contenu")).toBe(false);
    });
  
    it("refuse une note sans contenu", () => {
      expect(isNoteValid("un titre", "")).toBe(false);
    });
  
    it("accepte une note avec titre et contenu", () => {
      expect(isNoteValid("titre", "contenu")).toBe(true);
    });
  });
  