import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ─── Logout ───────────────────────────────────────────────────────────────────
// Blacklists the current token's JTI on the server so it's rejected on all
// future requests. Never throws — local logout must always succeed even if the
// server is unreachable.
export const logoutApi = async (
  token: string,
  role: "user" | "admin" | "superadmin"
): Promise<void> => {
  const endpoints: Record<string, string> = {
    user: "/logout",
    admin: "/admin/logout",
    superadmin: "/superadmin/logout",
  };
  try {
    await axios.post(
      `${VITE_API_URL}${endpoints[role] ?? "/logout"}`,
      {},
      getAuthHeaders(token)
    );
  } catch {
    // Swallowed — local state is always cleared regardless.
  }
};

// ─── Change own password ──────────────────────────────────────────────────────
// On success the backend blacklists the current session. Caller must call
// logout() locally and redirect to login immediately after this resolves.
export const changeOwnPassword = async (
  token: string,
  role: "user" | "admin" | "superadmin",
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const endpoints: Record<string, string> = {
    user: "/change-password",
    admin: "/admin/change-password",
    superadmin: "/superadmin/change-password",
  };
  try {
    await axios.post(
      `${VITE_API_URL}${endpoints[role] ?? "/change-password"}`,
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