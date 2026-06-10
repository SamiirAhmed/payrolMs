import api from "./api";

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
}

const reportService = {
  async getPayroll(params = {}) {
    const response = await api.get("/reports/payroll", { params: cleanParams(params) });
    return response.data.data;
  },
  async getAttendance(params = {}) {
    const response = await api.get("/reports/attendance", { params: cleanParams(params) });
    return response.data.data;
  },
  async getPayments(params = {}) {
    const response = await api.get("/reports/payments", { params: cleanParams(params) });
    return response.data.data;
  },
  async getEmployeeSalarySummary(params = {}) {
    const response = await api.get("/reports/employee-salary-summary", { params: cleanParams(params) });
    return response.data.data;
  }
};

export default reportService;
