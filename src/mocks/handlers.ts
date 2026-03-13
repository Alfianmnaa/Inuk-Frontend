import { http, HttpResponse, delay } from 'msw';

// ============================================
// Mock Data
// ============================================

// Donation mock data
const mockDonations = [
  {
    id: '1',
    kaleng: 'Kaleng 1',
    name: 'Donatur 1',
    desa_kelurahan: 'Desa 1',
    kecamatan: 'Kecamatan 1',
    kabupaten_kota: 'Kota 1',
    provinsi: 'Provinsi 1',
    total: 100000,
    date_time: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    kaleng: 'Kaleng 2',
    name: 'Donatur 2',
    desa_kelurahan: 'Desa 2',
    kecamatan: 'Kecamatan 2',
    kabupaten_kota: 'Kota 2',
    provinsi: 'Provinsi 2',
    total: 200000,
    date_time: '2025-01-16T10:00:00Z',
  },
];

const mockDonationRecap = {
  name: 'Rekapitulasi Donasi',
  total_donor: 100,
  total_donation: 50000000,
  kecamatan: [
    {
      name: 'Kecamatan 1',
      total_donor: 50,
      total_donation: 25000000,
      desa_kelurahan: [
        { name: 'Desa 1', total_donor: 25, total_donation: 12500000 },
        { name: 'Desa 2', total_donor: 25, total_donation: 12500000 },
      ],
    },
  ],
};

// Region mock data
const mockRegions = [
  {
    id: 'region-1',
    provinsi: 'Jawa Tengah',
    kabupaten_kota: 'Kudus',
    kecamatan: 'Kota Kudus',
    desa_kelurahan: 'Kudus',
    user: [{ user_id: 'user-1', user_name: 'User One' }],
  },
  {
    id: 'region-2',
    provinsi: 'Jawa Tengah',
    kabupaten_kota: 'Kudus',
    kecamatan: 'Jati',
    desa_kelurahan: 'Jati',
    user: [],
  },
];

// Masjid mock data
const mockMasjids = [
  {
    id: 'masjid-1',
    name: 'Masjid Al-Hidayah',
    admin_id: 'admin-1',
    region_id: 'region-1',
    provinsi: 'Jawa Tengah',
    kecamatan: 'Kota Kudus',
    kabupaten_kota: 'Kudus',
    desa_kelurahan: 'Kudus',
  },
  {
    id: 'masjid-2',
    name: 'Masjid Al-Ikhlas',
    admin_id: 'admin-2',
    region_id: 'region-2',
    provinsi: 'Jawa Tengah',
    kecamatan: 'Jati',
    kabupaten_kota: 'Kudus',
    desa_kelurahan: 'Jati',
  },
];

// Infaq mock data
const mockInfaqTransactions = [
  {
    id: 'infaq-1',
    name: 'Donatur Infaq 1',
    phone: '081234567890',
    total: 50000,
    date_time: '2025-01-15T10:00:00Z',
  },
  {
    id: 'infaq-2',
    name: 'Donatur Infaq 2',
    phone: '081234567891',
    total: 100000,
    date_time: '2025-01-16T10:00:00Z',
  },
];

// CMS mock data
const mockCMSContent = {
  title: 'Welcome to INUK',
  content: 'This is the main page content',
  last_updated: '2025-01-15T00:00:00Z',
};

// Donatur mock data
const mockDonaturs = [
  {
    id: 'donatur-1',
    kaleng: 'Kaleng 1',
    name: 'Donatur 1',
    phone: '081234567890',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'donatur-2',
    kaleng: 'Kaleng 2',
    name: 'Donatur 2',
    phone: '081234567891',
    created_at: '2025-01-02T00:00:00Z',
  },
];

// ============================================
// Helper Functions
// ============================================

const getAuthHeader = (request: Request): string | null => {
  return request.headers.get('authorization');
};

const isAuthenticated = (request: Request): boolean => {
  const auth = getAuthHeader(request);
  return !!auth && auth.startsWith('Bearer ');
};

// ============================================
// MSW Handlers - All 8 API Endpoints
// ============================================

export const handlers = [
  // ==========================================
  // DONATION Endpoints
  // ==========================================

  // GET /donations
  http.get('*/donations', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResult = mockDonations.slice(start, end);

    return HttpResponse.json({
      total_page: Math.ceil(mockDonations.length / pageSize),
      current_page: page,
      has_next_page: end < mockDonations.length,
      result: paginatedResult,
    });
  }),

  // POST /donation
  http.post('*/donation', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json() as { donor_id?: string; total?: number; date_time?: string };
    
    const newDonation = {
      id: String(mockDonations.length + 1),
      kaleng: 'New Kaleng',
      name: 'New Donatur',
      desa_kelurahan: 'New Desa',
      kecamatan: 'New Kecamatan',
      kabupaten_kota: 'New Kota',
      provinsi: 'New Provinsi',
      total: body.total || 0,
      date_time: body.date_time || new Date().toISOString(),
    };
    
    mockDonations.push(newDonation);
    return HttpResponse.json(newDonation, { status: 201 });
  }),

  // PATCH /donation/:id
  http.patch('*/donation/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const body = await request.json() as { total?: number; date_time?: string };
    
    const donation = mockDonations.find(d => d.id === id);
    if (!donation) {
      return HttpResponse.json({ message: 'Donation not found' }, { status: 404 });
    }
    
    donation.total = body.total || donation.total;
    donation.date_time = body.date_time || donation.date_time;
    return HttpResponse.json(donation);
  }),

  // DELETE /donation/:id
  http.delete('*/donation/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const index = mockDonations.findIndex(d => d.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ message: 'Donation not found' }, { status: 404 });
    }
    
    mockDonations.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /donations-recap
  http.get('*/donations-recap', async () => {
    await delay(50);
    return HttpResponse.json(mockDonationRecap);
  }),

  // GET /donations-recap/year
  http.get('*/donations-recap/year', async () => {
    await delay(50);
    return HttpResponse.json({ years: [2023, 2024, 2025, 2026] });
  }),

  // GET /donations-recap/month
  http.get('*/donations-recap/month', async () => {
    await delay(50);
    return HttpResponse.json({ months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
  }),

  // POST /export/donation
  http.post('*/export/donation', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      job_id: 'job-123',
      status: 'processing',
      message: 'Export started',
    });
  }),

  // ==========================================
  // USER Endpoints
  // ==========================================

  // GET /user/profile
  http.get('*/user/profile', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
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
    });
  }),

  // GET /user/treasurer
  http.get('*/user/treasurer', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      treasurer_phone: '081234567891',
      treasurer_name: 'Test Treasurer',
    });
  }),

  // PATCH /user/treasurer
  http.patch('*/user/treasurer', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      id: 'user-1',
      phone: '081234567890',
      name: 'Test User',
      treasurer_phone: '081234567999',
      treasurer_name: 'New Treasurer',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    });
  }),

  // GET /admin/users
  http.get('*/admin/users', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json([
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
    ]);
  }),

  // GET /admin/user/:id
  http.get('*/admin/user/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id,
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
    });
  }),

  // POST /register
  http.post('*/register', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ id: 'new-user-id', message: 'User created' }, { status: 201 });
  }),

  // PATCH /admin/user/:id
  http.patch('*/admin/user/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json({ id, message: 'User updated' });
  }),

  // DELETE /admin/user/:id
  http.delete('*/admin/user/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // ==========================================
  // ADMIN Endpoints
  // ==========================================

  // GET /admin/profile
  http.get('*/admin/profile', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
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
    });
  }),

  // GET /superadmin/admins
  http.get('*/superadmin/admins', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json([
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
    ]);
  }),

  // GET /superadmin/admin/:id
  http.get('*/superadmin/admin/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id,
      name: 'Admin One',
      phone: '081234567890',
      region_id: 'region-1',
      provinsi: 'Jawa Tengah',
      kecamatan: 'Kota Kudus',
      kabupaten_kota: 'Kudus',
      desa_kelurahan: 'Kudus',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    });
  }),

  // POST /admin/register
  http.post('*/admin/register', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ id: 'new-admin-id', message: 'Admin created' }, { status: 201 });
  }),

  // PATCH /superadmin/admin/:id
  http.patch('*/superadmin/admin/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return HttpResponse.json({ id, message: 'Admin updated' });
  }),

  // PATCH /superadmin/admin/:id/region
  http.patch('*/superadmin/admin/:id/region', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (id === 'nonexistent') {
      return HttpResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return HttpResponse.json({ id, message: 'Region updated' });
  }),

  // DELETE /superadmin/admin/:id
  http.delete('*/superadmin/admin/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
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
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      treasurer_phone: '081234567891',
      treasurer_name: 'Admin Treasurer',
    });
  }),

  // PATCH /admin/treasurer
  http.patch('*/admin/treasurer', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      id: 'admin-1',
      phone: '081234567890',
      name: 'Test Admin',
      treasurer_phone: '081234567999',
      treasurer_name: 'New Treasurer',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    });
  }),

  // ==========================================
  // REGION Endpoints
  // ==========================================

  // GET /regions
  http.get('*/regions', async () => {
    await delay(50);
    return HttpResponse.json(mockRegions);
  }),

  // POST /region
  http.post('*/region', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json() as { provinsi?: string; kabupaten_kota?: string; kecamatan?: string; desa_kelurahan?: string };
    const newRegion = {
      id: `region-${mockRegions.length + 1}`,
      provinsi: body.provinsi || '',
      kabupaten_kota: body.kabupaten_kota || '',
      kecamatan: body.kecamatan || '',
      desa_kelurahan: body.desa_kelurahan || '',
      user: [],
    };
    mockRegions.push(newRegion);
    return HttpResponse.json(newRegion, { status: 201 });
  }),

  // PATCH /region/:id
  http.patch('*/region/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const region = mockRegions.find(r => r.id === id);
    if (!region) {
      return HttpResponse.json({ message: 'Region not found' }, { status: 404 });
    }
    const body = await request.json() as { provinsi?: string; kabupaten_kota?: string; kecamatan?: string; desa_kelurahan?: string };
    Object.assign(region, body);
    return HttpResponse.json(region);
  }),

  // DELETE /region/:id
  http.delete('*/region/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const index = mockRegions.findIndex(r => r.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Region not found' }, { status: 404 });
    }
    mockRegions.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /region/:id/users
  http.post('*/region/:id/users', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const region = mockRegions.find(r => r.id === id);
    if (!region) {
      return HttpResponse.json({ message: 'Region not found' }, { status: 404 });
    }
    const body = await request.json() as { users?: string[] };
    return HttpResponse.json({ users: body.users || [] });
  }),

  // GET /region/provinces
  http.get('*/region/provinces', async () => {
    await delay(50);
    return HttpResponse.json([{ provinsi: 'Jawa Tengah' }, { provinsi: 'Jawa Timur' }]);
  }),

  // GET /region/cities
  http.get('*/region/cities', async () => {
    await delay(50);
    return HttpResponse.json([{ kabupaten_kota: 'Kudus' }, { kabupaten_kota: ' Jepara' }]);
  }),

  // GET /region/subdistricts
  http.get('*/region/subdistricts', async () => {
    await delay(50);
    return HttpResponse.json([{ kecamatan: 'Kota Kudus' }, { kecamatan: 'Jati' }]);
  }),

  // GET /region/villages
  http.get('*/region/villages', async () => {
    await delay(50);
    return HttpResponse.json([{ desa_kelurahan: 'Kudus' }, { desa_kelurahan: 'Jati' }]);
  }),

  // ==========================================
  // MASJID Endpoints
  // ==========================================

  // GET /masjids
  http.get('*/masjids', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockMasjids);
  }),

  // POST /masjid
  http.post('*/masjid', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json() as { name?: string; region_id?: string };
    const newMasjid = {
      id: `masjid-${mockMasjids.length + 1}`,
      name: body.name || 'New Masjid',
      admin_id: 'admin-1',
      region_id: body.region_id || 'region-1',
      provinsi: 'Jawa Tengah',
      kecamatan: 'Kota Kudus',
      kabupaten_kota: 'Kudus',
      desa_kelurahan: 'Kudus',
    };
    mockMasjids.push(newMasjid);
    return HttpResponse.json(newMasjid, { status: 201 });
  }),

  // PATCH /masjid/:id
  http.patch('*/masjid/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const masjid = mockMasjids.find(m => m.id === id);
    if (!masjid) {
      return HttpResponse.json({ message: 'Masjid not found' }, { status: 404 });
    }
    const body = await request.json() as { name?: string; region_id?: string; admin_id?: string };
    Object.assign(masjid, body);
    return HttpResponse.json(masjid);
  }),

  // DELETE /masjid/:id
  http.delete('*/masjid/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const index = mockMasjids.findIndex(m => m.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Masjid not found' }, { status: 404 });
    }
    mockMasjids.splice(index, 1);
    return HttpResponse.json({ id, is_deleted: true });
  }),

  // ==========================================
  // INFAQ Endpoints
  // ==========================================

  // GET /infaqs
  http.get('*/infaqs', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      total_page: 1,
      current_page: 1,
      has_next_page: false,
      result: mockInfaqTransactions,
    });
  }),

  // POST /infaq
  http.post('*/infaq', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json() as { name?: string; phone?: string; total?: number };
    const newInfaq = {
      id: `infaq-${mockInfaqTransactions.length + 1}`,
      name: body.name || 'New Donatur',
      phone: body.phone || '',
      total: body.total || 0,
      date_time: new Date().toISOString(),
    };
    mockInfaqTransactions.push(newInfaq);
    return HttpResponse.json(newInfaq, { status: 201 });
  }),

  // GET /infaq/recap
  http.get('*/infaq/recap', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      name: 'Rekapitulasi Infaq',
      total_donor: 50,
      total_infaq: 25000000,
    });
  }),

  // GET /infaq/recap/years
  http.get('*/infaq/recap/years', async () => {
    await delay(50);
    return HttpResponse.json({ years: [2023, 2024, 2025, 2026] });
  }),

  // POST /export/infaq
  http.post('*/export/infaq', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      job_id: 'infaq-job-123',
      status: 'processing',
      message: 'Export started',
    });
  }),

  // ==========================================
  // CMS Endpoints
  // ==========================================

  // GET /cms/content
  http.get('*/cms/content', async () => {
    await delay(50);
    return HttpResponse.json(mockCMSContent);
  }),

  // PATCH /cms/content
  http.patch('*/cms/content', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json() as { title?: string; content?: string };
    Object.assign(mockCMSContent, body, { last_updated: new Date().toISOString() });
    return HttpResponse.json(mockCMSContent);
  }),

  // ==========================================
  // DONATUR Endpoints
  // ==========================================

  // GET /donaturs
  http.get('*/donaturs', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      total_page: 1,
      current_page: 1,
      has_next_page: false,
      result: mockDonaturs,
    });
  }),

  // POST /donatur
  http.post('*/donatur', async ({ request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json() as { kaleng?: string; name?: string; phone?: string };
    const newDonatur = {
      id: `donatur-${mockDonaturs.length + 1}`,
      kaleng: body.kaleng || 'New Kaleng',
      name: body.name || 'New Donatur',
      phone: body.phone || '',
      created_at: new Date().toISOString(),
    };
    mockDonaturs.push(newDonatur);
    return HttpResponse.json(newDonatur, { status: 201 });
  }),

  // PATCH /donatur/:id
  http.patch('*/donatur/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const donatur = mockDonaturs.find(d => d.id === id);
    if (!donatur) {
      return HttpResponse.json({ message: 'Donatur not found' }, { status: 404 });
    }
    const body = await request.json() as { kaleng?: string; name?: string; phone?: string };
    Object.assign(donatur, body);
    return HttpResponse.json(donatur);
  }),

  // DELETE /donatur/:id
  http.delete('*/donatur/:id', async ({ params, request }) => {
    await delay(50);
    if (!isAuthenticated(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const index = mockDonaturs.findIndex(d => d.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Donatur not found' }, { status: 404 });
    }
    mockDonaturs.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
