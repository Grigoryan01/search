import { useSelectedItemsStore } from './selectedItemsStore';
import type { Product } from '../types';

const productA: Product = { id: 1, title: 'Phone', description: 'Smartphone' };
const productB: Product = { id: 2, title: 'Laptop', description: 'Notebook' };

describe('selectedItemsStore', () => {
  beforeEach(() => {
    useSelectedItemsStore.setState({ selectedItems: {} });
  });

  it('starts with no selected items', () => {
    expect(useSelectedItemsStore.getState().selectedItems).toEqual({});
  });

  it('adds an item when toggled on', () => {
    useSelectedItemsStore.getState().toggleItem(productA);

    expect(useSelectedItemsStore.getState().selectedItems[1]).toEqual(productA);
    expect(useSelectedItemsStore.getState().isSelected(1)).toBe(true);
  });

  it('removes an item when toggled off', () => {
    useSelectedItemsStore.getState().toggleItem(productA);
    useSelectedItemsStore.getState().toggleItem(productA);

    expect(useSelectedItemsStore.getState().isSelected(1)).toBe(false);
    expect(useSelectedItemsStore.getState().selectedItems[1]).toBeUndefined();
  });

  it('tracks multiple selected items', () => {
    useSelectedItemsStore.getState().toggleItem(productA);
    useSelectedItemsStore.getState().toggleItem(productB);

    expect(Object.keys(useSelectedItemsStore.getState().selectedItems)).toHaveLength(2);
  });

  it('clears all selected items', () => {
    useSelectedItemsStore.getState().toggleItem(productA);
    useSelectedItemsStore.getState().toggleItem(productB);
    useSelectedItemsStore.getState().clearAll();

    expect(useSelectedItemsStore.getState().selectedItems).toEqual({});
  });
});
