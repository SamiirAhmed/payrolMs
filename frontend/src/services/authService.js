import api from "./api";

const authService = {
  async login({ email, password }) {
    const response = await api.post("/auth/login", {
      email_or_username: email,
      password
    });
    return response.data.data;
  },

  async getProfile() {
    const token = localStorage.getItem("payflow_token");
    if (!token) return null;

    try {
      const response = await api.get("/auth/me");
      return response.data.data;
    } catch (_error) {
      localStorage.removeItem("payflow_token");
      localStorage.removeItem("payflow_user");
      return null;
    }
  },

  async changePassword(payload) {
    const response = await api.put("/auth/change-password", payload);
    return response.data;
  }
};

export default authService;
