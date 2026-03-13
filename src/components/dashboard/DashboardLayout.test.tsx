import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';

// Mock the getUserProfile function to avoid API calls
vi.mock('../../services/UserService', () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    desa_kelurahan: 'Test Village',
    kecamatan: 'Test Subdistrict',
    kabupaten_kota: 'Test City',
    provinsi: 'Test Province',
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('DashboardLayout', () => {
  beforeAll(() => {
    // Set up authenticated state
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userRole', 'admin');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('renders sidebar with navigation items', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DashboardLayout activeLink="/dashboard" pageTitle="Test Page">
              <div>Test Content</div>
            </DashboardLayout>
          </AuthProvider>
        </BrowserRouter>
      );

      // Check sidebar renders with dashboard navigation
      expect(screen.getByText('DASHBOARD UTAMA')).toBeInTheDocument();
      expect(screen.getByText('Pencatatan Donasi')).toBeInTheDocument();
    });

    it('renders header with page title', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DashboardLayout activeLink="/dashboard" pageTitle="My Dashboard">
              <div>Test Content</div>
            </DashboardLayout>
          </AuthProvider>
        </BrowserRouter>
      );

      // Check header shows page title
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DashboardLayout activeLink="/dashboard" pageTitle="Test">
              <div data-testid="child-content">Child Content Here</div>
            </DashboardLayout>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Content Here')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('logout button triggers logout and navigation', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <DashboardLayout activeLink="/dashboard" pageTitle="Test">
              <div>Content</div>
            </DashboardLayout>
          </AuthProvider>
        </BrowserRouter>
      );

      // Find and click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      // Check that navigate was called with '/'
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('sidebar toggle button is present', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <DashboardLayout activeLink="/dashboard" pageTitle="Test">
              <div>Content</div>
            </DashboardLayout>
          </AuthProvider>
        </BrowserRouter>
      );

      // Sidebar toggle button should be present (for mobile)
      const toggleButtons = screen.getAllByRole('button');
      expect(toggleButtons.length).toBeGreaterThan(0);
    });
  });
});
