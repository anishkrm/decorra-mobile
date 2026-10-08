import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { InteriorStyle, RoomType } from '../services/contracts';

export type DraftPhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
};

function createDraftId() {
  return `draft-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export type MakeoverDraftState = {
  draftId: string;
  photo: DraftPhoto | null;
  roomType: RoomType | null;
  style: InteriorStyle | null;
  instructions: string;
  preparedAt: string | null;
  hydrated: boolean;
  setPhoto: (photo: DraftPhoto | null) => void;
  setRoomType: (roomType: RoomType) => void;
  setStyle: (style: InteriorStyle) => void;
  setInstructions: (instructions: string) => void;
  setPreparedAt: (preparedAt: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  renewDraftId: () => void;
  resetDraft: () => void;
};

export const useMakeoverDraftStore = create<MakeoverDraftState>()(
  persist(
    (set) => ({
      draftId: createDraftId(),
      photo: null,
      roomType: null,
      style: null,
      instructions: '',
      preparedAt: null,
      hydrated: false,
      setPhoto: (photo) => set((state) => ({
        photo,
        draftId: state.preparedAt ? createDraftId() : state.draftId,
        preparedAt: null,
      })),
      setRoomType: (roomType) => set((state) => ({
        roomType,
        draftId: state.preparedAt ? createDraftId() : state.draftId,
        preparedAt: null,
      })),
      setStyle: (style) => set((state) => ({
        style,
        draftId: state.preparedAt ? createDraftId() : state.draftId,
        preparedAt: null,
      })),
      setInstructions: (instructions) => set((state) => ({
        instructions,
        draftId: state.preparedAt ? createDraftId() : state.draftId,
        preparedAt: null,
      })),
      setPreparedAt: (preparedAt) => set({ preparedAt }),
      setHydrated: (hydrated) => set({ hydrated }),
      renewDraftId: () => set({ draftId: createDraftId(), preparedAt: null }),
      resetDraft: () => set({
        draftId: createDraftId(),
        photo: null,
        roomType: null,
        style: null,
        instructions: '',
        preparedAt: null,
      }),
    }),
    {
      name: 'ai-room-makeover.draft.v1',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ draftId, photo, roomType, style, instructions, preparedAt }) => ({
        draftId,
        photo,
        roomType,
        style,
        instructions,
        preparedAt,
      }),
      migrate: (persistedState) => {
        const draft = persistedState as Partial<Pick<MakeoverDraftState, 'draftId' | 'photo' | 'roomType' | 'style' | 'instructions' | 'preparedAt'>>;
        return {
          ...draft,
          draftId: draft.draftId ?? createDraftId(),
        };
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
