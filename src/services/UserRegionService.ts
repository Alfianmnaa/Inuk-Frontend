import { getUserProfile } from "./UserService";
import { getAdminProfile } from "./AdminService";

export interface RegionProfile {
  province: string;
  city: string;
  subdistrict: string;
  village: string;
}

export const NONE_REGION: RegionProfile = {
  province: "NONE",
  city: "NONE",
  subdistrict: "NONE",
  village: "NONE",
};

let cachedToken: string | null = null;
let cachedPromise: Promise<RegionProfile> | null = null;

export const getRegionProfile = (
  token: string | null,
  role: "user" | "admin" | "superadmin" | null
): Promise<RegionProfile> => {
  if (!token || (role !== "user" && role !== "admin")) {
    return Promise.resolve(NONE_REGION);
  }

  if (cachedToken === token && cachedPromise) {
    return cachedPromise;
  }

  cachedToken = token;
  const fetcher = role === "user" ? getUserProfile : getAdminProfile;

  cachedPromise = fetcher(token)
    .then((profile: any) => {
      const subdistrict = profile.kecamatan || "";
      if (!subdistrict || subdistrict === "N/A") {
        return NONE_REGION;
      }

      const result: RegionProfile = {
        province: profile.provinsi || "",
        city: profile.kabupaten_kota || "",
        subdistrict,
        village: profile.desa_kelurahan || "",
      };

      localStorage.setItem("user_province", result.province);
      localStorage.setItem("user_city", result.city);
      localStorage.setItem("user_subdistrict", result.subdistrict);
      localStorage.setItem("user_village", result.village);

      return result;
    })
    .catch(() => NONE_REGION);

  return cachedPromise;
};

export const clearRegionProfileCache = () => {
  cachedToken = null;
  cachedPromise = null;
};
