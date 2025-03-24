import { create } from "zustand";

export interface SQLdate {
  columns: string[] | null;
  sqlColumns: Object[] | null;
  setSQL: (sqlColumns: Object[] | null) => void;
  setColumns: (columns: string[] | null) => void;
}

export const useSQLStore = create<SQLdate>((set) => ({
  columns: null,
  sqlColumns: null,
  setSQL: (sqlColumns: Object[] | null) => set({ sqlColumns }),
  setColumns: (columns: string[] | null) => set({ columns }),
}));
