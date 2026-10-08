import { create } from 'zustand';

export type AppTab = 'home' | 'designs' | 'plans' | 'profile';
export type DemoIdentity = 'guest' | 'signed-in-preview';

export type NavigationState = {
  activeTab: AppTab;
  identity: DemoIdentity;
  creationOpen: boolean;
  progressOpen: boolean;
  draftLabel: string | null;
  setTab: (tab: AppTab) => void;
  setIdentity: (identity: DemoIdentity) => void;
  openCreation: () => void;
  closeCreation: () => void;
  openProgress: () => void;
  closeProgress: () => void;
  setDraftLabel: (label: string | null) => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'home',
  identity: 'guest',
  creationOpen: false,
  progressOpen: false,
  draftLabel: null,
  setTab: (activeTab) => set({ activeTab, creationOpen: false, progressOpen: false }),
  setIdentity: (identity) => set({ identity }),
  openCreation: () => set({ creationOpen: true, progressOpen: false }),
  closeCreation: () => set({ creationOpen: false }),
  openProgress: () => set({ progressOpen: true, creationOpen: false }),
  closeProgress: () => set({ progressOpen: false }),
  setDraftLabel: (draftLabel) => set({ draftLabel }),
}));
