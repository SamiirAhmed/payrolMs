import { allowanceTypes, employeeAllowances } from "../data/mockData";
import { makeCrudService } from "./mockServiceFactory";

const typeService = makeCrudService(allowanceTypes);
const assignmentService = makeCrudService(employeeAllowances);

export default {
  ...typeService,
  async listAssignments() {
    return Promise.resolve(employeeAllowances);
  },
  async createAssignment(payload) {
    return assignmentService.create(payload);
  }
};
