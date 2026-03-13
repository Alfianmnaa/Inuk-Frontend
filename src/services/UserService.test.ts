import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import {
  getUserProfile,
  getTreasurer,
  getUsers,
  getUserFromID,
  updateTreasurer,
  adminRegisterUser,
  updateUser,
  deleteUser,
} from '../services/UserService';

// Mock data
const mockUserProfile = {
  id: 'user-1',
  phone: '081234567890',
  name: 'Test User',
  treasurer_phone: '081234567891',
  treasurer_name: 'Test Treasurer',
  region_id: 'region-1',
  provinsi: 'Jawa Tengah',
  kecamatan: 'Kota Kudus',
  kabupaten_kota: 'Kudus',
  desa_kelurahan: 'Kudus',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

const mockTreasurer = {
  treasurer_phone: '081234567891',
  treasurer_name: 'Test Treasurer',
};

const mockUsers = [
  {
    id: 'user-1',
    name: 'User One',
    phone: '081234567890',
    region_id: 'region-1',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'User Two',
    phone: '081234567891',
    region_id: null,
    created_at: '2025-01-02T00:00:00Z',
  },
];

const mockUserFromID = {
  id: 'user-1',
  name: 'User One',
  phone: '081234567890',
  treasurer_name: 'Treasurer One',
  region_id: 'region-1',
  provinsi: 'Jawa Tengah',
  kecamatan: 'Kota Kudus',
  kabupaten_kota: 'Kudus',
  desa_kelurahan: 'Kudus',
  donors: [
    { id: 'donor-1', kaleng: 'Kaleng 1' },
    { id: 'donor-2', kaleng: 'Kaleng 2' },
  ],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

const mockUpdateTreasurerResponse = {
  id: 'user-1',
  phone: '081234567890',
  name: 'Test User',
  treasurer_phone: '081234567999',
  treasurer_name: 'New Treasurer',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

// MSW handlers
const userHandlers = [
  // GET /user/profile
  http.get('*/user/profile', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockUserProfile);
  }),

  // GET /user/treasurer
  http.get('*/user/treasurer', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockTreasurer);
  }),

  // GET /admin/users
  http.get('*/admin/users', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockUsers);
  }),

  // GET /admin/user/:id
  http.get('*/admin/user/:id', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(mockUserFromID);
  }),

  // PATCH /user/treasurer
  http.patch('*/user/treasurer', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockUpdateTreasurerResponse);
  }),

  // POST /register (admin register user)
  http.post('*/register', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ id: 'new-user-id', message: 'User created' }, { status: 201 });
  }),

  // PATCH /admin/user/:id (admin update user)
  http.patch('*/admin/user/:id', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json({ id, message: 'User updated' });
  }),

  // DELETE /admin/user/:id (admin delete user)
  http.delete('*/admin/user/:id', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

// Create server instance
const server = setupServer(...userHandlers);

describe('UserService', () => {
  const validToken = 'test-token-123';

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const response = await getUserProfile(validToken);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('phone');
      expect(response).toHaveProperty('treasurer_phone');
      expect(response).toHaveProperty('treasurer_name');
      expect(response).toHaveProperty('region_id');
    });

    it('should throw error when token is missing', async () => {
      await expect(getUserProfile('')).rejects.toThrow();
    });
  });

  describe('getTreasurer', () => {
    it('should return treasurer data', async () => {
      const response = await getTreasurer(validToken);

      expect(response).toHaveProperty('treasurer_phone');
      expect(response).toHaveProperty('treasurer_name');
    });

    it('should throw error when token is missing', async () => {
      await expect(getTreasurer('')).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should return list of users', async () => {
      const response = await getUsers(validToken);

      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
      expect(response[0]).toHaveProperty('id');
      expect(response[0]).toHaveProperty('name');
      expect(response[0]).toHaveProperty('phone');
    });

    it('should accept filter parameters', async () => {
      const response = await getUsers(validToken, 'User One', '081234567890');

      expect(Array.isArray(response)).toBe(true);
    });

    it('should throw error when token is missing', async () => {
      await expect(getUsers('')).rejects.toThrow();
    });
  });

  describe('getUserFromID', () => {
    it('should return user details by ID', async () => {
      const response = await getUserFromID(validToken, 'user-1');

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('donors');
      expect(Array.isArray(response.donors)).toBe(true);
    });

    it('should throw error for nonexistent user', async () => {
      await expect(getUserFromID(validToken, 'nonexistent')).rejects.toThrow();
    });
  });

  describe('updateTreasurer', () => {
    it('should update treasurer and return new data', async () => {
      const payload = {
        treasurer_name: 'New Treasurer',
        treasurer_phone: '081234567999',
      };

      const response = await updateTreasurer(validToken, payload);

      expect(response).toHaveProperty('id');
      expect(response.treasurer_name).toBe('New Treasurer');
    });

    it('should throw error when token is missing', async () => {
      await expect(updateTreasurer('', { treasurer_name: 'Test', treasurer_phone: '123' })).rejects.toThrow();
    });
  });

  describe('adminRegisterUser', () => {
    it('should register a new user', async () => {
      const payload = {
        name: 'New User',
        phone: '081234567999',
        password: 'password123',
      };

      const response = await adminRegisterUser(validToken, payload);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('message');
    });
  });

  describe('updateUser', () => {
    it('should update user and return success', async () => {
      const payload = {
        name: 'Updated Name',
        phone: '081234567999',
      };

      const response = await updateUser(validToken, 'user-1', payload);

      expect(response).toHaveProperty('message');
    });

    it('should throw error for nonexistent user', async () => {
      await expect(updateUser(validToken, 'nonexistent', { name: 'Test' })).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('should delete user without error', async () => {
      await expect(deleteUser(validToken, 'user-1')).resolves.not.toThrow();
    });

    it('should throw error for nonexistent user', async () => {
      await expect(deleteUser(validToken, 'nonexistent')).rejects.toThrow();
    });
  });
});
