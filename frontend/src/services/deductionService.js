import { deductionTypes, employeeDeductions } from "../data/mockData";
import { makeCrudService } from "./mockServiceFactory";

const typeService = makeCrudService(deductionTypes);
const assignmentService = makeCrudService(employeeDeductions);

export default {
  ...typeService,
  async listAssignments() {
    return Promise.resolve(employeeDeductions);
  },
  async createAssignment(payload) {
    return assignmentService.create(payload);
  }
};
