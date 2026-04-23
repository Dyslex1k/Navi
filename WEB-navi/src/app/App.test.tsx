import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App routing', () => {
  it('renders login page for unauthenticated users', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Map Manager Login/i })).toBeInTheDocument();
  });
});
