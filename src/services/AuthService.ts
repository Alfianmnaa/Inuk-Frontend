import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ─── Logout ───────────────────────────────────────────────────────────────────
// Blacklists the current token's JTI on the server.
// Always call BEFORE clearing the local token.
// Never throws — if the server is unreachable, local logout must still proceed.
export const logoutApi = async (
  token: string,
  role: "user" | "admin" | "superadmin"
): Promise<void> => {
  const endpointMap: Record<string, string> = {
    user: "/logout",
    admin: "/admin/logout",
    superadmin: "/superadmin/logout",
  };
  try {
    await axios.post(
      `${VITE_API_URL}${endpointMap[role] ?? "/logout"}`,
      {},
      getAuthHeaders(token)
    );
  } catch {
    // Swallowed intentionally — local state is always cleared regardless.
  }
};

// ─── Change own password ──────────────────────────────────────────────────────
// On success the backend blacklists the current session. The caller MUST
// also call logout() locally and redirect to login after this resolves.
export const changeOwnPassword = async (
  token: string,
  role: "user" | "admin" | "superadmin",
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const endpointMap: Record<string, string> = {
    user: "/change-password",
    admin: "/admin/change-password",
    superadmin: "/superadmin/change-password",
  };
  try {
    await axios.post(
      `${VITE_API_URL}${endpointMap[role] ?? "/change-password"}`,
      { current_password: currentPassword, new_password: newPassword },
      getAuthHeaders(token)
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message ||
          error.response.data?.error ||
          "Gagal mengubah kata sandi."
      );
    }
    throw new Error("Terjadi kesalahan jaringan.");
  }
};

// ─── Admin / superadmin resets a user's password ─────────────────────────────
export const resetUserPassword = async (
  token: string,
  userId: string,
  newPassword: string
): Promise<void> => {
  try {
    await axios.patch(
      `${VITE_API_URL}/admin/users/${userId}/password`,
      { new_password: newPassword },
      getAuthHeaders(token)
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message ||
          error.response.data?.error ||
          "Gagal mereset kata sandi pengguna."
      );
    }
    throw new Error("Terjadi kesalahan jaringan.");
  }
};

// ─── Superadmin resets an admin's password ────────────────────────────────────
export const resetAdminPassword = async (
  token: string,
  adminId: string,
  newPassword: string
): Promise<void> => {
  try {
    await axios.patch(
      `${VITE_API_URL}/superadmin/admins/${adminId}/password`,
      { new_password: newPassword },
      getAuthHeaders(token)
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message ||
          error.response.data?.error ||
          "Gagal mereset kata sandi admin."
      );
    }
    throw new Error("Terjadi kesalahan jaringan.");
  }
};