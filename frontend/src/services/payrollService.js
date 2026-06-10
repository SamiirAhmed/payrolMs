import api from "./api";

const payrollService = {
  async listPeriods() {
    const response = await api.get("/payroll/periods");
    return response.data.data;
  },
  async createPeriod(payload) {
    const response = await api.post("/payroll/periods", payload);
    return response.data.data;
  },
  async updatePeriod(id, payload) {
    const response = await api.put(`/payroll/periods/${id}`, payload);
    return response.data.data;
  },
  async deletePeriod(id) {
    const response = await api.delete(`/payroll/periods/${id}`);
    return response.data;
  },
  async updatePeriodStatus(id, status) {
    const response = await api.patch(`/payroll/periods/${id}/status`, { status });
    return response.data.data;
  },
  async processEmployee(periodId, employeeId) {
    const response = await api.post(`/payroll/process/${periodId}/employee/${employeeId}`);
    return response.data.data;
  },
  async processAll(periodId) {
    const response = await api.post(`/payroll/process/${periodId}/all`);
    return response.data.data;
  },
  async list(params = {}) {
    const response = await api.get("/payroll", { params });
    return response.data.data;
  },
  async getById(id) {
    const response = await api.get(`/payroll/${id}`);
    return response.data.data;
  },
  async getDetails(id) {
    const response = await api.get(`/payroll/${id}/details`);
    return response.data.data;
  },
  async update(id, payload) {
    const response = await api.put(`/payroll/${id}`, payload);
    return response.data.data;
  },
  async remove(id) {
    const response = await api.delete(`/payroll/${id}`);
    return response.data;
  },
  async listPayslips() {
    const response = await api.get("/payroll/payslips");
    return response.data.data;
  },
  async getPayslipById(id) {
    const response = await api.get(`/payroll/payslips/${id}`);
    return response.data.data;
  },
  async generatePayslip(payrollId) {
    const response = await api.post(`/payroll/payslips/${payrollId}/generate`);
    return response.data.data;
  },
  async deletePayslip(id) {
    const response = await api.delete(`/payroll/payslips/${id}`);
    return response.data;
  },
  async listPayments() {
    const response = await api.get("/payroll/payments");
    return response.data.data;
  },
  async createPayment(payload) {
    const response = await api.post("/payroll/payments", payload);
    return response.data.data;
  },
  async updatePayment(id, payload) {
    const response = await api.put(`/payroll/payments/${id}`, payload);
    return response.data.data;
  },
  async getPaymentById(id) {
    const response = await api.get(`/payroll/payments/${id}`);
    return response.data.data;
  },
  async deletePayment(id) {
    const response = await api.delete(`/payroll/payments/${id}`);
    return response.data;
  }
};

export default payrollService;
