import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';

type RenderWithProvidersOptions = RenderOptions & {
  routerProps?: MemoryRouterProps;
};

export const renderWithProviders = (
  ui: ReactElement,
  { routerProps, ...renderOptions }: RenderWithProvidersOptions = {}
) =>
  render(
    <ThemeProvider>
      <MemoryRouter {...routerProps}>{ui}</MemoryRouter>
    </ThemeProvider>,
    renderOptions
  );
