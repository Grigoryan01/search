import { render, screen } from '@testing-library/react';
import { Main } from './Main';

describe('Main', () => {
  it('renders children correctly', () => {
    render(
      <Main>
        <p>Child content</p>
      </Main>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders inside a main element', () => {
    render(
      <Main>
        <p>Content</p>
      </Main>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Main>
        <p>First child</p>
        <p>Second child</p>
      </Main>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
  });
});
