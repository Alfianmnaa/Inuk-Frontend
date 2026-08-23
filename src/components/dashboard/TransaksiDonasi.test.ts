import { describe, it, expect } from 'vitest';
import { isDonationExportReady, buildExtractFilters } from '../../utils/donationExport';
import { NONE_REGION } from '../../services/UserRegionService';

const readyAddress = { province: 'Jawa Tengah', city: 'Kudus', subdistrict: 'Kaliwungu', village: 'Karanganyar' };

describe('isDonationExportReady', () => {
  it('returns false while the region context is still loading', () => {
    expect(
      isDonationExportReady({
        userRole: 'admin',
        isRegionEnforcementLoading: true,
        isUserBlocked: false,
        addressFilters: readyAddress,
      })
    ).toBe(false);
  });

  it('returns false when the account is blocked (unbound region)', () => {
    expect(
      isDonationExportReady({
        userRole: 'admin',
        isRegionEnforcementLoading: false,
        isUserBlocked: true,
        addressFilters: readyAddress,
      })
    ).toBe(false);
  });

  it('returns false for superadmin before the location filters are initialized', () => {
    expect(
      isDonationExportReady({
        userRole: 'superadmin',
        isRegionEnforcementLoading: false,
        isUserBlocked: false,
        addressFilters: { province: '', city: '', subdistrict: '', village: '' },
      })
    ).toBe(false);
  });

  it('returns true for a ready admin', () => {
    expect(
      isDonationExportReady({
        userRole: 'admin',
        isRegionEnforcementLoading: false,
        isUserBlocked: false,
        addressFilters: readyAddress,
      })
    ).toBe(true);
  });

  it('returns true for a ready superadmin with initialized filters', () => {
    expect(
      isDonationExportReady({
        userRole: 'superadmin',
        isRegionEnforcementLoading: false,
        isUserBlocked: false,
        addressFilters: { province: 'Jawa Tengah', city: 'Kudus', subdistrict: '', village: '' },
      })
    ).toBe(true);
  });

  it('returns true for a ready user', () => {
    expect(
      isDonationExportReady({
        userRole: 'user',
        isRegionEnforcementLoading: false,
        isUserBlocked: false,
        addressFilters: readyAddress,
      })
    ).toBe(true);
  });
});

describe('buildExtractFilters', () => {
  it('builds user filters from the enforced region profile', () => {
    const filters = buildExtractFilters('user', { province: 'Jawa Tengah', city: 'Kudus', subdistrict: 'Kaliwungu', village: 'Karanganyar' }, readyAddress, '2026-08-01', '2026-08-09');

    expect(filters).toEqual({
      provinsi: 'Jawa Tengah',
      kabupaten_kota: 'Kudus',
      kecamatan: 'Kaliwungu',
      desa_kelurahan: 'Karanganyar',
      startDate: new Date(2026, 7, 1).toISOString(),
      endDate: new Date(2026, 7, 9, 23, 59, 59).toISOString(),
    });
  });

  it('builds admin filters from the enforced region profile plus the selected village', () => {
    const filters = buildExtractFilters('admin', { province: 'Jawa Tengah', city: 'Kudus', subdistrict: 'Kaliwungu', village: 'Garung Lor' }, readyAddress, '', '');

    expect(filters).toEqual({
      provinsi: 'Jawa Tengah',
      kabupaten_kota: 'Kudus',
      kecamatan: 'Kaliwungu',
      desa_kelurahan: 'Karanganyar',
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('keeps the unbound marker instead of silently dropping it', () => {
    const filters = buildExtractFilters('admin', NONE_REGION, readyAddress, '', '');

    expect(filters.provinsi).toBe('NONE');
    expect(filters.kabupaten_kota).toBe('NONE');
    expect(filters.kecamatan).toBe('NONE');
  });

  it('builds superadmin filters from the address selector', () => {
    const filters = buildExtractFilters('superadmin', NONE_REGION, { province: 'Jawa Tengah', city: 'Kudus', subdistrict: 'Kaliwungu', village: '' }, '', '');

    expect(filters).toEqual({
      provinsi: 'Jawa Tengah',
      kabupaten_kota: 'Kudus',
      kecamatan: 'Kaliwungu',
      desa_kelurahan: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  });
});
