import { create } from "zustand";

export interface SQLdate {
  colums: string[] | null;
  sqlColumns: string[] | null;
  setSQL: (sqlColumns: string[] | null) => void;
  setColums: (colums: string[] | null) => void;
}

export const useSQLStore = create<SQLdate>((set) => ({
  colums: null,
  sqlColumns: null,
  setSQL: (sqlColumns: string[] | null) => set({ sqlColumns }),
  setColums: (colums: string[] | null) => set({ colums }),
}));
