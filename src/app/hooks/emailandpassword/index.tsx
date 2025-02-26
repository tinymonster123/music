import { create } from "zustand";

export interface EmailRef {
  emailRef?: React.RefObject<HTMLInputElement | null>;
}

export interface PasswordRef {
  passwordRef?: React.RefObject<HTMLLabelElement | null>;
}

export interface Refs extends EmailRef, PasswordRef {
  setEmailRef: (ref: React.RefObject<HTMLInputElement | null>) => void;
  setPasswordRef: (ref: React.RefObject<HTMLLabelElement | null>) => void;
}

export interface CustomRef
  extends React.ComponentPropsWithoutRef<"form">,
    EmailRef,
    PasswordRef {}

const useEmailAndPasswordStore = create<Refs>((set) => ({
  emailRef: { current: null },
  passwordRef: { current: null },
  setEmailRef: (ref: React.RefObject<HTMLInputElement | null>) =>
    set({ emailRef: ref }),
  setPasswordRef: (ref: React.RefObject<HTMLLabelElement | null>) =>
    set({ passwordRef: ref }),
}));

export default useEmailAndPasswordStore;
