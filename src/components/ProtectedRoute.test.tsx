import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Test component to render as children
const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Unauthenticated access', () => {
    it('should not render children when not authenticated', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestChild />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should NOT see protected content when not authenticated
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should not render children when token is null', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestChild />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated access', () => {
    it('should render children when authenticated with valid token', () => {
      // Pre-set localStorage with auth token
      localStorage.setItem('token', 'test-token-123');
      localStorage.setItem('userRole', 'admin');

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestChild />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should see the protected content when authenticated
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should render children when user has admin role', () => {
      localStorage.setItem('token', 'admin-token');
      localStorage.setItem('userRole', 'admin');

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestChild />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should render children when user has superadmin role', () => {
      localStorage.setItem('token', 'superadmin-token');
      localStorage.setItem('userRole', 'superadmin');

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestChild />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});
