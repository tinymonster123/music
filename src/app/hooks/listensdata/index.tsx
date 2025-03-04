import { create } from "zustand";

export interface PieData {
  listens: number;
  title: string;
}

export interface ListenState {
  listendata: PieData[];
  setListen: (listendata: PieData[]) => void;
}

const useListenStore = create<ListenState>((set) => ({
  listendata: [
    {
      listens: 0,
      title: "",
    },
  ],
  setListen: (listendata) => set({ listendata }),
}));

export default useListenStore;
