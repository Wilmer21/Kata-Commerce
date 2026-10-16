import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CapAlert } from '../../components/CapAlert.js';

describe('CapAlert Component', () => {
  it('no debe renderizar nada si isCapReached es false', () => {
    const { container } = render(<CapAlert isCapReached={false} effectivePercentage={20} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el mensaje exacto obligatorio cuando isCapReached es true', () => {
    render(<CapAlert isCapReached={true} effectivePercentage={35} />);

    const banner = screen.getByTestId('cap-alert-banner');
    expect(banner).toBeInTheDocument();
    expect(
      screen.getByText(/¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido \(35%\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Ahorro actual: 35%/i)).toBeInTheDocument();
  });
});
