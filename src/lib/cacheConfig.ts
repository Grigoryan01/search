const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export const getCacheTtlMs = (): number => {
  const raw = import.meta.env.VITE_CACHE_TTL_MS;

  if (raw === undefined || raw === '') {
    return DEFAULT_CACHE_TTL_MS;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_CACHE_TTL_MS;
  }

  return parsed;
};
