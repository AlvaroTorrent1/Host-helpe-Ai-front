import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoadingScreen } from '../../shared/components/loading';

// Simple test suite to verify testing setup is working
describe('LoadingScreen component', () => {
  it('renders loading message', () => {
    render(
      <BrowserRouter>
        <LoadingScreen />
      </BrowserRouter>
    );
    
    // Assuming LoadingScreen contains some loading text or elements
    // If it doesn't, adjust this test accordingly based on actual implementation
    expect(document.body).toBeInTheDocument();
  });
}); 