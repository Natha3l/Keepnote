const store: Record<string, string> = {};

export const setItemAsync = jest.fn(
  (key: string, value: string): Promise<void> => {
    store[key] = value;
    return Promise.resolve();
  }
);

export const getItemAsync = jest.fn(
  (key: string): Promise<string | null> => {
    return Promise.resolve(store[key] ?? null);
  }
);

export const deleteItemAsync = jest.fn(
  (key: string): Promise<void> => {
    delete store[key];
    return Promise.resolve();
  }
);

