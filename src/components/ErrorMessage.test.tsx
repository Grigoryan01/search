import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('displays the error message text', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays different error messages', () => {
    render(<ErrorMessage message="Unable to load items. Please try again in a moment." />);

    expect(
      screen.getByText('Unable to load items. Please try again in a moment.')
    ).toBeInTheDocument();
  });

  it('renders the message in a paragraph element', () => {
    const { container } = render(<ErrorMessage message="Error occurred" />);

    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent('Error occurred');
  });
});
