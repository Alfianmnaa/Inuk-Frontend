import type { AddressSelection } from "../components/dashboard/AddressSelector";
import type { DonationsExtractFilter } from "../services/DonationService";
import type { RegionProfile } from "../services/UserRegionService";

export const isDonationExportReady = (input: {
  userRole: string | null;
  isRegionEnforcementLoading: boolean;
  isUserBlocked: boolean;
  addressFilters: AddressSelection;
}): boolean => {
  if (input.isRegionEnforcementLoading) return false;
  if (input.isUserBlocked) return false;
  if (input.userRole === "superadmin" && (!input.addressFilters.province || !input.addressFilters.city)) return false;
  return true;
};

export const buildExtractFilters = (
  userRole: string | null,
  userRegionFilter: RegionProfile,
  addressFilters: AddressSelection,
  startDateFilter: string,
  endDateFilter: string
): DonationsExtractFilter => {
  const getRfc3339 = (dateStr: string, isEnd: boolean): string | undefined => {
    if (!dateStr) return undefined;
    const [y, m, d] = dateStr.split("-").map(Number);
    const localDate = isEnd
      ? new Date(y, m - 1, d, 23, 59, 59)
      : new Date(y, m - 1, d);
    return localDate.toISOString();
  };

  if (userRole === "user") {
    return {
      provinsi: userRegionFilter.province,
      kabupaten_kota: userRegionFilter.city,
      kecamatan: userRegionFilter.subdistrict,
      desa_kelurahan: userRegionFilter.village,
      startDate: getRfc3339(startDateFilter, false),
      endDate: getRfc3339(endDateFilter, true),
    };
  }
  if (userRole === "admin") {
    return {
      provinsi: userRegionFilter.province || undefined,
      kabupaten_kota: userRegionFilter.city || undefined,
      kecamatan: userRegionFilter.subdistrict || undefined,
      desa_kelurahan: addressFilters.village || undefined,
      startDate: getRfc3339(startDateFilter, false),
      endDate: getRfc3339(endDateFilter, true),
    };
  }
  return {
    provinsi: addressFilters.province || undefined,
    kabupaten_kota: addressFilters.city || undefined,
    kecamatan: addressFilters.subdistrict || undefined,
    desa_kelurahan: addressFilters.village || undefined,
    startDate: getRfc3339(startDateFilter, false),
    endDate: getRfc3339(endDateFilter, true),
  };
};
