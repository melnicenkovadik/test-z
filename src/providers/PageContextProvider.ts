import { create } from "zustand";

interface PageState {
  isMobile: boolean;
  isMetaMask: boolean;
  setIsMobile: (value: boolean) => void;
  setIsMetaMask: (value: boolean) => void;
}

export const usePageContext = create<PageState>((set) => ({
  isMobile: false,
  isMetaMask: false,
  setIsMobile: (value) => set({ isMobile: value }),
  setIsMetaMask: (value) => set({ isMetaMask: value }),
}));
