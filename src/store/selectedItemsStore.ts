import { create } from 'zustand';
import type { Product } from '../types';

type SelectedItemsState = {
  selectedItems: Record<number, Product>;
  toggleItem: (item: Product) => void;
  clearAll: () => void;
  isSelected: (id: number) => boolean;
};

export const useSelectedItemsStore = create<SelectedItemsState>((set, get) => ({
  selectedItems: {},
  toggleItem: (item) =>
    set((state) => {
      const next = { ...state.selectedItems };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = item;
      }
      return { selectedItems: next };
    }),
  clearAll: () => set({ selectedItems: {} }),
  isSelected: (id) => Boolean(get().selectedItems[id]),
}));

export const selectSelectedItemsCount = (state: SelectedItemsState) =>
  Object.keys(state.selectedItems).length;
