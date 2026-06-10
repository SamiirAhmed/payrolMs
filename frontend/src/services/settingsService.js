import api from "./api";

const settingsService = {
  async getCompany() {
    const response = await api.get("/settings/company");
    return response.data.data;
  },
  async updateCompany(payload, isFormData = false) {
    const response = await api.put("/settings/company", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined
    });
    return response.data.data;
  },
  async getPayroll() {
    const response = await api.get("/settings/payroll");
    return response.data.data;
  },
  async updatePayroll(payload) {
    const response = await api.put("/settings/payroll", payload);
    return response.data.data;
  },
  async getProfile() {
    const response = await api.get("/settings/profile");
    return response.data.data;
  },
  async updateProfile(payload) {
    const response = await api.put("/settings/profile", payload);
    return response.data.data;
  }
};

export default settingsService;
