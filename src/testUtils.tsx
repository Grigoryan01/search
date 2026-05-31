import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { createTestQueryClient } from './lib/queryClient';

type RenderWithProvidersOptions = RenderOptions & {
  routerProps?: MemoryRouterProps;
};

export const renderWithProviders = (
  ui: ReactElement,
  { routerProps, ...renderOptions }: RenderWithProvidersOptions = {}
) => {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter {...routerProps}>{ui}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
      renderOptions
    ),
  };
};
