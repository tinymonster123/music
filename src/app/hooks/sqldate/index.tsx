import { create } from "zustand";

export interface SQLdate {
  sql: string | null;
  setSQL: (sql: string | null) => void;
}

export const useSQLStore = create<SQLdate>((set) => ({
  sql: null,
  setSQL: (sql: string | null) => set({ sql }),
}));
