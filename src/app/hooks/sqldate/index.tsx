import { create } from "zustand";

export interface SQLdate {
  columns: string[] | null;
  sqlColumns: string[] | null;
  setSQL: (sqlColumns: string[] | null) => void;
  setColumns: (columns: string[] | null) => void;
}

export const useSQLStore = create<SQLdate>((set) => ({
  columns: null,
  sqlColumns: null,
  setSQL: (sqlColumns: string[] | null) => set({ sqlColumns }),
  setColumns: (columns: string[] | null) => set({ columns }),
}));
