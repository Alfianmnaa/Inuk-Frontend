import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import {
  getAdminProfile,
  getAdmins,
  getAdminFromID,
  adminRegisterAdmin,
  updateAdmin,
  updateDeleteAdminRegion,
  deleteAdmin,
  getAdminTreasurer,
  updateAdminTreasurer,
} from '../services/AdminService';

// Mock data
const mockAdminProfile = {
  id: 'admin-1',
  phone: '081234567890',
  name: 'Test Admin',
  region_id: 'region-1',
  provinsi: 'Jawa Tengah',
  kecamatan: 'Kota Kudus',
  kabupaten_kota: 'Kudus',
  desa_kelurahan: 'Kudus',
  treasurer_name: 'Admin Treasurer',
  treasurer_phone: '081234567891',
};

const mockAdmins = [
  {
    id: 'admin-1',
    name: 'Admin One',
    phone: '081234567890',
    region_id: 'region-1',
    provinsi: 'Jawa Tengah',
    kecamatan: 'Kota Kudus',
    kabupaten_kota: 'Kudus',
    desa_kelurahan: 'Kudus',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'Admin Two',
    phone: '081234567891',
    region_id: null,
    provinsi: 'Jawa Tengah',
    kecamatan: 'Kota Kudus',
    kabupaten_kota: 'Kudus',
    desa_kelurahan: 'Kudus',
    created_at: '2025-01-02T00:00:00Z',
  },
];

const mockAdminFromID = {
  id: 'admin-1',
  name: 'Admin One',
  phone: '081234567890',
  region_id: 'region-1',
  provinsi: 'Jawa Tengah',
  kecamatan: 'Kota Kudus',
  kabupaten_kota: 'Kudus',
  desa_kelurahan: 'Kudus',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

const mockAdminTreasurer = {
  treasurer_phone: '081234567891',
  treasurer_name: 'Admin Treasurer',
};

const mockUpdateAdminTreasurerResponse = {
  id: 'admin-1',
  phone: '081234567890',
  name: 'Test Admin',
  treasurer_phone: '081234567999',
  treasurer_name: 'New Treasurer',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

// MSW handlers
const adminHandlers = [
  // GET /admin/profile
  http.get('*/admin/profile', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockAdminProfile);
  }),

  // GET /superadmin/admins
  http.get('*/superadmin/admins', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockAdmins);
  }),

  // GET /superadmin/admin/:id
  http.get('*/superadmin/admin/:id', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return HttpResponse.json(mockAdminFromID);
  }),

  // POST /admin/register
  http.post('*/admin/register', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ id: 'new-admin-id', message: 'Admin created' }, { status: 201 });
  }),

  // PATCH /superadmin/admin/:id
  http.patch('*/superadmin/admin/:id', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return HttpResponse.json({ id, message: 'Admin updated' });
  }),

  // PATCH /superadmin/admin/:id/region
  http.patch('*/superadmin/admin/:id/region', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return HttpResponse.json({ id, message: 'Region updated' });
  }),

  // DELETE /superadmin/admin/:id
  http.delete('*/superadmin/admin/:id', async ({ request, params }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /admin/treasurer
  http.get('*/admin/treasurer', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockAdminTreasurer);
  }),

  // PATCH /admin/treasurer
  http.patch('*/admin/treasurer', async ({ request }) => {
    await delay(50);
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockUpdateAdminTreasurerResponse);
  }),
];

// Create server instance
const server = setupServer(...adminHandlers);

describe('AdminService', () => {
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

  describe('getAdminProfile', () => {
    it('should return admin profile data', async () => {
      const response = await getAdminProfile(validToken);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('phone');
      expect(response).toHaveProperty('treasurer_name');
      expect(response).toHaveProperty('treasurer_phone');
      expect(response).toHaveProperty('region_id');
    });

    it('should throw error when token is missing', async () => {
      await expect(getAdminProfile('')).rejects.toThrow();
    });
  });

  describe('getAdmins', () => {
    it('should return list of admins', async () => {
      const response = await getAdmins(validToken);

      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
      expect(response[0]).toHaveProperty('id');
      expect(response[0]).toHaveProperty('name');
      expect(response[0]).toHaveProperty('phone');
    });

    it('should accept filter parameters', async () => {
      const response = await getAdmins(validToken, 'Admin One', '081234567890');

      expect(Array.isArray(response)).toBe(true);
    });

    it('should throw error when token is missing', async () => {
      await expect(getAdmins('')).rejects.toThrow();
    });
  });

  describe('getAdminFromID', () => {
    it('should return admin details by ID', async () => {
      const response = await getAdminFromID(validToken, 'admin-1');

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('phone');
    });

    it('should throw error for nonexistent admin', async () => {
      await expect(getAdminFromID(validToken, 'nonexistent')).rejects.toThrow();
    });
  });

  describe('adminRegisterAdmin', () => {
    it('should register a new admin', async () => {
      const payload = {
        name: 'New Admin',
        phone: '081234567999',
        password: 'password123',
      };

      const response = await adminRegisterAdmin(validToken, payload);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('message');
    });
  });

  describe('updateAdmin', () => {
    it('should update admin and return success', async () => {
      const payload = {
        name: 'Updated Name',
        phone: '081234567999',
      };

      const response = await updateAdmin(validToken, 'admin-1', payload);

      expect(response).toHaveProperty('message');
    });

    it('should throw error for nonexistent admin', async () => {
      await expect(updateAdmin(validToken, 'nonexistent', { name: 'Test' })).rejects.toThrow();
    });
  });

  describe('updateDeleteAdminRegion', () => {
    it('should update admin region', async () => {
      const payload = {
        region_id: 'new-region-id',
      };

      const response = await updateDeleteAdminRegion(validToken, 'admin-1', payload);

      expect(response).toHaveProperty('message');
    });
  });

  describe('deleteAdmin', () => {
    it('should delete admin without error', async () => {
      await expect(deleteAdmin(validToken, 'admin-1')).resolves.not.toThrow();
    });

    it('should throw error for nonexistent admin', async () => {
      await expect(deleteAdmin(validToken, 'nonexistent')).rejects.toThrow();
    });
  });

  describe('getAdminTreasurer', () => {
    it('should return admin treasurer data', async () => {
      const response = await getAdminTreasurer(validToken);

      expect(response).toHaveProperty('treasurer_phone');
      expect(response).toHaveProperty('treasurer_name');
    });

    it('should throw error when token is missing', async () => {
      await expect(getAdminTreasurer('')).rejects.toThrow();
    });
  });

  describe('updateAdminTreasurer', () => {
    it('should update admin treasurer and return new data', async () => {
      const payload = {
        treasurer_name: 'New Treasurer',
        treasurer_phone: '081234567999',
      };

      const response = await updateAdminTreasurer(validToken, payload);

      expect(response).toHaveProperty('id');
      expect(response.treasurer_name).toBe('New Treasurer');
    });

    it('should throw error when token is missing', async () => {
      await expect(updateAdminTreasurer('', { treasurer_name: 'Test', treasurer_phone: '123' })).rejects.toThrow();
    });
  });
});
