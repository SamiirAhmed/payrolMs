import api from "./api";

const employeeService = {
  async list(params = {}) {
    const response = await api.get("/employees", { params });
    return response.data.data;
  },
  async getById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },
  async create(payload) {
    const response = await api.post("/employees", payload);
    return response.data.data;
  },
  async update(id, payload) {
    const response = await api.put(`/employees/${id}`, payload);
    return response.data.data;
  },
  async updateStatus(id, status) {
    const response = await api.patch(`/employees/${id}/status`, { status });
    return response.data.data;
  },
  async remove(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  async listDepartments() {
    const response = await api.get("/employees/departments");
    return response.data.data;
  },
  async createDepartment(payload) {
    const response = await api.post("/employees/departments", payload);
    return response.data.data;
  },
  async updateDepartment(id, payload) {
    const response = await api.put(`/employees/departments/${id}`, payload);
    return response.data.data;
  },
  async deleteDepartment(id) {
    const response = await api.delete(`/employees/departments/${id}`);
    return response.data;
  },
  async listPositions() {
    const response = await api.get("/employees/positions");
    return response.data.data;
  },
  async createPosition(payload) {
    const response = await api.post("/employees/positions", payload);
    return response.data.data;
  },
  async updatePosition(id, payload) {
    const response = await api.put(`/employees/positions/${id}`, payload);
    return response.data.data;
  },
  async deletePosition(id) {
    const response = await api.delete(`/employees/positions/${id}`);
    return response.data;
  },
  async listSalaryStructures() {
    const response = await api.get("/employees/salary-structures");
    return response.data.data;
  },
  async createSalaryStructure(payload) {
    const response = await api.post("/employees/salary-structures", payload);
    return response.data.data;
  },
  async updateSalaryStructure(id, payload) {
    const response = await api.put(`/employees/salary-structures/${id}`, payload);
    return response.data.data;
  },
  async deleteSalaryStructure(id) {
    const response = await api.delete(`/employees/salary-structures/${id}`);
    return response.data;
  },
  async listAllowanceTypes() {
    const response = await api.get("/employees/allowance-types");
    return response.data.data;
  },
  async createAllowanceType(payload) {
    const response = await api.post("/employees/allowance-types", payload);
    return response.data.data;
  },
  async updateAllowanceType(id, payload) {
    const response = await api.put(`/employees/allowance-types/${id}`, payload);
    return response.data.data;
  },
  async deleteAllowanceType(id) {
    const response = await api.delete(`/employees/allowance-types/${id}`);
    return response.data;
  },
  async listAllowances() {
    const response = await api.get("/employees/allowances");
    return response.data.data;
  },
  async createAllowance(payload) {
    const response = await api.post("/employees/allowances", payload);
    return response.data.data;
  },
  async updateAllowance(id, payload) {
    const response = await api.put(`/employees/allowances/${id}`, payload);
    return response.data.data;
  },
  async deleteAllowance(id) {
    const response = await api.delete(`/employees/allowances/${id}`);
    return response.data;
  },
  async listDeductionTypes() {
    const response = await api.get("/employees/deduction-types");
    return response.data.data;
  },
  async createDeductionType(payload) {
    const response = await api.post("/employees/deduction-types", payload);
    return response.data.data;
  },
  async updateDeductionType(id, payload) {
    const response = await api.put(`/employees/deduction-types/${id}`, payload);
    return response.data.data;
  },
  async deleteDeductionType(id) {
    const response = await api.delete(`/employees/deduction-types/${id}`);
    return response.data;
  },
  async listDeductions() {
    const response = await api.get("/employees/deductions");
    return response.data.data;
  },
  async createDeduction(payload) {
    const response = await api.post("/employees/deductions", payload);
    return response.data.data;
  },
  async updateDeduction(id, payload) {
    const response = await api.put(`/employees/deductions/${id}`, payload);
    return response.data.data;
  },
  async deleteDeduction(id) {
    const response = await api.delete(`/employees/deductions/${id}`);
    return response.data;
  }
};

export default employeeService;
