import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react'; // Update from react-dom/test-utils
import axios from 'axios';
import App from './App.js'; // Add import with .js

jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    axios.get.mockImplementation(url => {
      if (url === 'http://localhost:3000/api/message') {
        return Promise.resolve({ data: { message: 'Hello from the backend!' } });
      }
      if (url === 'http://localhost:3000/api/products') {
        return Promise.resolve({
          data: [
            { id: 1, name: 'T-Shirt', price: 20 },
            { id: 2, name: 'Jeans', price: 40 },
          ],
        });
      }
      return Promise.reject(new Error('Not found'));
    });
    axios.post.mockImplementation(url => {
      if (url === 'http://localhost:3000/api/login') {
        return Promise.resolve({ data: { success: true, token: 'mock-token' } });
      }
      return Promise.reject(new Error('Invalid'));
    });
  });

  test('renders welcome message', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/React Webapp/i)).toBeInTheDocument();
  });

  test('displays products after login', async () => {
    await act(async () => {
      render(<App />);
    });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('T-Shirt - $20')).toBeInTheDocument();
      expect(screen.getByText('Jeans - $40')).toBeInTheDocument();
    });
  });
});