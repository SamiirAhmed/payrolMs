import api from "./api";

const attendanceService = {
  async list(params = {}) {
    const response = await api.get("/attendance", { params });
    return response.data.data;
  },
  async create(payload) {
    const response = await api.post("/attendance", payload);
    return response.data.data;
  },
  async update(id, payload) {
    const response = await api.put(`/attendance/${id}`, payload);
    return response.data.data;
  },
  async remove(id) {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
  async listOvertime(params = {}) {
    const response = await api.get("/attendance/overtime", { params });
    return response.data.data;
  },
  async createOvertime(payload) {
    const response = await api.post("/attendance/overtime", payload);
    return response.data.data;
  },
  async updateOvertime(id, payload) {
    const response = await api.put(`/attendance/overtime/${id}`, payload);
    return response.data.data;
  },
  async updateOvertimeStatus(id, status) {
    const response = await api.patch(`/attendance/overtime/${id}/status`, { status });
    return response.data.data;
  },
  async deleteOvertime(id) {
    const response = await api.delete(`/attendance/overtime/${id}`);
    return response.data;
  }
};

export default attendanceService;
