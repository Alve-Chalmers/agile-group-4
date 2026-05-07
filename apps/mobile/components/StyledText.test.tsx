import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonoText } from './StyledText';

describe('MonoText', () => {
  it('renders children', () => {
    render(<MonoText>Hello</MonoText>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
