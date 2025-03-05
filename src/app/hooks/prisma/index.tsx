import { create } from "zustand";
import { PrismaClient } from "@prisma/client";
import { Client } from "ssh2";

export interface Prisma {
  prismaClient: PrismaClient | null;
  sshClient: Client | null;
  setPrismaClient: (prismaClient: PrismaClient | null) => void;
  setSSHClient: (sshClient: Client | null) => void;
  clear: () => void;
}

const usePrismaStore = create<Prisma>((set) => ({
  prismaClient: null,
  sshClient: null,
  setPrismaClient: (prismaClient) => set({ prismaClient }),
  setSSHClient: (sshClient) => set({ sshClient }),
  clear: () => set({ prismaClient: null, sshClient: null }),
}));

export default usePrismaStore;
