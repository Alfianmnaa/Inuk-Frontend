import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should have null token when no token in localStorage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });
      expect(result.current.token).toBeNull();
    });

    it('should have null userRole when no role in localStorage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });
      expect(result.current.userRole).toBeNull();
    });

    it('should not be authenticated when token is null', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should set token and role in state and localStorage when logging in', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('test-token-123', 'admin');
      });

      expect(result.current.token).toBe('test-token-123');
      expect(result.current.userRole).toBe('admin');
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token-123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'admin');
    });

    it('should authenticate with superadmin role', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('superadmin-token', 'superadmin');
      });

      expect(result.current.token).toBe('superadmin-token');
      expect(result.current.userRole).toBe('superadmin');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should authenticate with user role', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('user-token', 'user');
      });

      expect(result.current.token).toBe('user-token');
      expect(result.current.userRole).toBe('user');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear token and role from state and localStorage', () => {
      // First login
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('test-token', 'admin');
      });

      expect(result.current.token).toBe('test-token');
      expect(result.current.userRole).toBe('admin');

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userRole');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('valid-token', 'user');
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false when token is null', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return false after logout', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('some-token', 'admin');
      });
      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Role-based access', () => {
    it('should store user role correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('token', 'user');
      });

      expect(result.current.userRole).toBe('user');
    });

    it('should store admin role correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('token', 'admin');
      });

      expect(result.current.userRole).toBe('admin');
    });

    it('should store superadmin role correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login('token', 'superadmin');
      });

      expect(result.current.userRole).toBe('superadmin');
    });
  });

  describe('useAuth hook', () => {
    it('should return context values correctly', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty('token');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('userRole');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
    });
  });
});
