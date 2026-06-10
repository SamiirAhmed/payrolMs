import {
  MdAccessTime,
  MdDashboard
} from "react-icons/md";
import { FaMoneyCheckAlt, FaUsers } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import { IoSettingsSharp } from "react-icons/io5";

export const users = [
  {
    id: 1,
    name: "Aisha Muli",
    email: "admin@payflow.app",
    role: "Admin",
    department: "Operations",
    title: "System Administrator",
    password: "password123"
  }
];

export const sidebarItems = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  { key: "employee", label: "Employee", path: "/employee", icon: FaUsers },
  { key: "attendance", label: "Attendance", path: "/attendance", icon: MdAccessTime },
  { key: "payroll", label: "Payroll", path: "/payroll", icon: FaMoneyCheckAlt },
  { key: "reporting", label: "Reporting", path: "/reporting", icon: HiDocumentReport },
  { key: "setting", label: "Setting", path: "/setting", icon: IoSettingsSharp }
];

export const notifications = [
  { id: 1, title: "April payroll period is still open", time: "6 min ago" },
  { id: 2, title: "3 payments are still pending review", time: "22 min ago" },
  { id: 3, title: "2 attendance corrections need approval", time: "1 hr ago" }
];

export const departments = [
  { id: 1, name: "Finance", head: "Grace Wanjiku", employees: 18, status: "Active" },
  { id: 2, name: "People", head: "David Mwangi", employees: 11, status: "Active" },
  { id: 3, name: "Engineering", head: "Alex Kimani", employees: 29, status: "Active" },
  { id: 4, name: "Operations", head: "Aisha Muli", employees: 14, status: "Active" }
];

export const positions = [
  { id: 1, name: "Payroll Specialist", department: "Finance", level: "Senior", status: "Active" },
  { id: 2, name: "Talent Partner", department: "People", level: "Mid", status: "Active" },
  { id: 3, name: "Software Engineer", department: "Engineering", level: "Mid", status: "Active" },
  { id: 4, name: "Office Manager", department: "Operations", level: "Senior", status: "Active" }
];

export const employees = [
  {
    id: 1,
    employeeCode: "EMP-1001",
    firstName: "Kevin",
    lastName: "Otieno",
    fullName: "Kevin Otieno",
    department: "Engineering",
    position: "Software Engineer",
    phone: "+254 712 123 111",
    email: "kevin.otieno@payflow.app",
    employmentType: "Full-time",
    gender: "Male",
    status: "Active",
    basicSalary: 5200,
    hireDate: "2023-02-14",
    bankName: "Equity Bank",
    accountNumber: "0012457812",
    address: "Westlands, Nairobi"
  },
  {
    id: 2,
    employeeCode: "EMP-1002",
    firstName: "Mercy",
    lastName: "Akinyi",
    fullName: "Mercy Akinyi",
    department: "People",
    position: "Talent Partner",
    phone: "+254 712 123 222",
    email: "mercy.akinyi@payflow.app",
    employmentType: "Full-time",
    gender: "Female",
    status: "Active",
    basicSalary: 4300,
    hireDate: "2022-07-02",
    bankName: "KCB",
    accountNumber: "2256789134",
    address: "Kilimani, Nairobi"
  },
  {
    id: 3,
    employeeCode: "EMP-1003",
    firstName: "Brian",
    lastName: "Kuria",
    fullName: "Brian Kuria",
    department: "Finance",
    position: "Payroll Specialist",
    phone: "+254 712 123 333",
    email: "brian.kuria@payflow.app",
    employmentType: "Contract",
    gender: "Male",
    status: "On Leave",
    basicSalary: 4700,
    hireDate: "2024-01-18",
    bankName: "Absa",
    accountNumber: "4478012789",
    address: "Ruiru, Kiambu"
  },
  {
    id: 4,
    employeeCode: "EMP-1004",
    firstName: "Lydia",
    lastName: "Mutheu",
    fullName: "Lydia Mutheu",
    department: "Operations",
    position: "Office Manager",
    phone: "+254 712 123 444",
    email: "lydia.mutheu@payflow.app",
    employmentType: "Full-time",
    gender: "Female",
    status: "Active",
    basicSalary: 3900,
    hireDate: "2021-09-11",
    bankName: "NCBA",
    accountNumber: "6734219081",
    address: "Karen, Nairobi"
  }
];

export const attendance = [
  { id: 1, employee: "Kevin Otieno", date: "2026-04-17", checkIn: "08:10", checkOut: "17:35", status: "Present", workedHours: "9.4", remarks: "On time" },
  { id: 2, employee: "Mercy Akinyi", date: "2026-04-17", checkIn: "08:36", checkOut: "17:22", status: "Late", workedHours: "8.8", remarks: "Traffic delay" },
  { id: 3, employee: "Brian Kuria", date: "2026-04-17", checkIn: "09:01", checkOut: "13:10", status: "Half-day", workedHours: "4.1", remarks: "Medical review" },
  { id: 4, employee: "Lydia Mutheu", date: "2026-04-17", checkIn: "08:03", checkOut: "17:42", status: "Present", workedHours: "9.6", remarks: "Field operations" }
];

export const overtimeRecords = [
  { id: 1, employee: "Kevin Otieno", overtimeDate: "2026-04-15", hoursWorked: 4, ratePerHour: 28, status: "Approved", totalAmount: 112 },
  { id: 2, employee: "Mercy Akinyi", overtimeDate: "2026-04-14", hoursWorked: 2.5, ratePerHour: 22, status: "Pending", totalAmount: 55 },
  { id: 3, employee: "Lydia Mutheu", overtimeDate: "2026-04-12", hoursWorked: 3, ratePerHour: 20, status: "Rejected", totalAmount: 60 }
];

export const payrollPeriods = [
  { id: 1, periodName: "April 2026", startDate: "2026-04-01", endDate: "2026-04-30", status: "Open" },
  { id: 2, periodName: "March 2026", startDate: "2026-03-01", endDate: "2026-03-31", status: "Closed" },
  { id: 3, periodName: "February 2026", startDate: "2026-02-01", endDate: "2026-02-28", status: "Closed" }
];

export const payrolls = [
  { id: 1, period: "April 2026", employee: "Kevin Otieno", grossSalary: 5872, netSalary: 5352, status: "Approved", processedDate: "2026-04-18" },
  { id: 2, period: "April 2026", employee: "Mercy Akinyi", grossSalary: 4775, netSalary: 4385, status: "Draft", processedDate: "2026-04-18" },
  { id: 3, period: "March 2026", employee: "Lydia Mutheu", grossSalary: 4260, netSalary: 3970, status: "Paid", processedDate: "2026-03-31" }
];

export const payslips = [
  { id: 1, payslipNumber: "PS-20260418-1", employee: "Kevin Otieno", period: "April 2026", generatedDate: "2026-04-18", netSalary: 5352 },
  { id: 2, payslipNumber: "PS-20260331-3", employee: "Lydia Mutheu", period: "March 2026", generatedDate: "2026-03-31", netSalary: 3970 }
];

export const payments = [
  { id: 1, payroll: "Kevin Otieno - April 2026", paymentDate: "2026-04-20", paymentMethod: "Bank", referenceNumber: "BNK-449921", amountPaid: 5352, paymentStatus: "Completed" },
  { id: 2, payroll: "Mercy Akinyi - April 2026", paymentDate: "2026-04-21", paymentMethod: "Mobile Money", referenceNumber: "MPS-239118", amountPaid: 4385, paymentStatus: "Pending" }
];

export const payrollTrend = [
  { month: "Nov", payroll: 221000 },
  { month: "Dec", payroll: 228000 },
  { month: "Jan", payroll: 235000 },
  { month: "Feb", payroll: 249000 },
  { month: "Mar", payroll: 268000 },
  { month: "Apr", payroll: 284000 }
];

export const reportSummary = {
  payroll: [
    { label: "Total Payroll", value: 284000, currency: true },
    { label: "Employees Paid", value: 67 },
    { label: "Pending Payrolls", value: 5 }
  ],
  attendance: [
    { label: "Attendance Rate", value: "96.2%" },
    { label: "Late Records", value: 14 },
    { label: "Leave Days", value: 22 }
  ],
  payment: [
    { label: "Completed Payments", value: 61 },
    { label: "Pending Payments", value: 14 },
    { label: "Failed Payments", value: 4 }
  ]
};

export const reportTables = {
  payroll: payrolls,
  attendance,
  payment: payments
};
