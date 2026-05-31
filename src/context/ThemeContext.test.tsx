import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from '../hooks/useTheme';

const ThemeReader = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button type="button" onClick={() => setTheme('dark')}>
        Use dark
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        Use light
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('provides the default light theme', () => {
    render(
      <ThemeProvider>
        <ThemeReader />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('updates theme through context', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeReader />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: /use dark/i }));

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('throws when useTheme is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ThemeReader />)).toThrow('useTheme must be used within ThemeProvider');

    consoleError.mockRestore();
  });
});
