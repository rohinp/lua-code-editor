/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the CodeMirror component - we still want to isolate the UI component
jest.mock('@uiw/react-codemirror', () => ({
  __esModule: true,
  default: () => <div data-testid="codemirror-mock">Mocked CodeMirror</div>,
}));

describe('App Integration', () => { // Changed describe block name to indicate integration test
  test('loads model correctly with actual paths', async () => {
    render(<App />);

    // Wait for the model loading to complete (without mocking)
    await waitFor(() => {
      expect(screen.getByText('Model and tokenizer loaded successfully.')).toBeInTheDocument();
      expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument();
    }, { timeout: 60000 }); // Increased timeout to 60 seconds
  }, 60000); // Increased test timeout to 60 seconds
});
