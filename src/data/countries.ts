export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Australia',
  'Japan',
  'Brazil',
  'India',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Norway',
  'Poland',
  'Ukraine',
  'South Korea',
  'China',
  'Argentina',
] as const;

export type Country = (typeof COUNTRIES)[number];
