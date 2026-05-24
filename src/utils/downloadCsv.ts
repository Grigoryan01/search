import type { Product } from '../types';
import { buildProductDetailsUrl } from './productDetailsUrl';

const escapeCsvField = (value: string): string => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const productToCsvRow = (product: Product): string => {
  const detailsUrl = buildProductDetailsUrl(product.id);
  return [
    String(product.id),
    escapeCsvField(product.title),
    escapeCsvField(product.description),
    escapeCsvField(detailsUrl),
  ].join(',');
};

export const downloadSelectedItemsAsCsv = (items: Product[]): void => {
  if (!items.length) {
    return;
  }

  const header = 'id,name,description,details_url';
  const rows = items.map(productToCsvRow);
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${items.length}_items.csv`;
  link.click();
  URL.revokeObjectURL(objectUrl);
};
