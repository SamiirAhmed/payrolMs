# Payroll Management System - Documentation

**Version:** 1.0.0  |  **Repository:** https://github.com/SamiirAhmed/payrolMs.git

---

## System Overview

The **Payroll Management System** is a comprehensive web application designed to manage employee payroll operations, attendance tracking, overtime calculations, allowances, deductions, and payslip generation for organizations.

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│          Frontend (React + Vite on Port 5173)            │
│  Dashboard | Employees | Payroll | Attendance | Reports │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP/REST API
                        │
┌───────────────────────▼──────────────────────────────────┐
│   Backend (Node.js + Express on Port 5000)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Controllers | Services | Middleware | Validators  │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────┘
                        │ SQL Queries
                        │
┌───────────────────────▼──────────────────────────────────┐
│      MySQL Database (Port 3306)                         │
│  20+ Tables | Stored Procedures | User Roles           │
└──────────────────────────────────────────────────────────┘
```


---

## PAGE 1: SYSTEM OVERVIEW & DATABASE

### Key Modules

1. **Authentication** - User login/logout with JWT tokens and role-based access control
2. **Employee Management** - Track employee information, departments, and positions
3. **Attendance** - Record daily attendance, check-in/out times, and leave management
4. **Payroll Processing** - Calculate salaries with allowances, deductions, and overtime
5. **Overtime Management** - Track and calculate overtime hours and pay
6. **Allowances & Deductions** - Manage recurring and one-time allowances/deductions
7. **Payslip Generation** - Auto-generate and manage employee payslips
8. **Reports** - Generate payroll, attendance, and employee reports
9. **Dashboard** - Overview of system metrics and recent activity
10. **Settings** - Configure company information and payroll parameters

### Database Structure

**Total Tables: 20+**

| Table Name | Purpose |
|------------|---------|
| `users` | System user accounts and login credentials |
| `roles` | User role definitions (Admin, HR, Accountant, Employee) |
| `employees` | Employee personal and employment information |
| `departments` | Organization departments |
| `positions` | Job positions/titles |
| `attendance` | Daily attendance records |
| `payroll_periods` | Payroll cycle definitions |
| `payrolls` | Processed payroll records |
| `payslips` | Generated payslips for employees |
| `allowance_types` | Types of allowances available |
| `employee_allowances` | Allowances assigned to employees |
| `deduction_types` | Types of deductions available |
| `employee_deductions` | Deductions assigned to employees |
| `overtime_records` | Employee overtime hours and calculations |
| `company_settings` | Company profile and configuration |
| `payroll_settings` | Payroll parameters (tax %, pension %, cycle) |
| `payments` | Payment transaction records |
| `reports` | Generated report logs |
| `leaves` | Employee leave records |
| `audit_logs` | System activity audit trail |

### User Roles & Permissions

- **Admin** - Full system access, user management, settings
- **HR Manager** - Employee management, attendance, leave approval
- **Accountant** - Payroll processing, reports, payments
- **Employee** - View own profile, attendance, payslips

---

## PAGE 2: API ENDPOINTS & RESPONSES

### API Base URL
```
http://localhost:5000/api
```

### Authentication Headers
All endpoints (except login/register) require:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
Success: { "success": true, "message": "...", "data": {...} }
Error: { "success": false, "message": "...", "error": {...} }
```

### Complete API Endpoints

#### **Authentication** (No JWT required for login/register)
```
POST   /api/auth/register         - User registration
POST   /api/auth/login            - User login
POST   /api/auth/logout           - User logout
GET    /api/auth/profile          - Get current user profile
PUT    /api/auth/profile          - Update user profile
PUT    /api/auth/change-password  - Change password
```

#### **Employees** (Requires Auth)
```
GET    /api/employees             - List all employees
GET    /api/employees/:id         - Get specific employee
POST   /api/employees             - Create new employee
PUT    /api/employees/:id         - Update employee details
DELETE /api/employees/:id         - Remove employee
GET    /api/employees/stats       - Employee statistics
```

#### **Departments** (Requires Auth)
```
GET    /api/departments           - List all departments
POST   /api/departments           - Create department
PUT    /api/departments/:id       - Update department
DELETE /api/departments/:id       - Delete department
```

#### **Positions** (Requires Auth)
```
GET    /api/positions             - List all positions
POST   /api/positions             - Create position
PUT    /api/positions/:id         - Update position
DELETE /api/positions/:id         - Delete position
```

#### **Attendance** (Requires Auth)
```
GET    /api/attendance            - List attendance records
POST   /api/attendance            - Record attendance
GET    /api/attendance/:id        - Get specific record
PUT    /api/attendance/:id        - Update attendance
DELETE /api/attendance/:id        - Delete record
GET    /api/attendance/report     - Generate attendance report
```

#### **Payroll** (Requires Auth + Accountant Role)
```
GET    /api/payroll               - List payroll records
POST   /api/payroll               - Create payroll entry
PUT    /api/payroll/:id           - Update payroll
POST   /api/payroll/process       - Process monthly payroll
GET    /api/payroll/report        - Payroll summary report
DELETE /api/payroll/:id           - Delete payroll record
```

#### **Overtime** (Requires Auth)
```
GET    /api/overtime              - List overtime records
POST   /api/overtime              - Record overtime
PUT    /api/overtime/:id          - Update overtime
GET    /api/overtime/approve/:id  - Approve overtime
GET    /api/overtime/reject/:id   - Reject overtime
```

#### **Allowances & Deductions** (Requires Auth)
```
GET    /api/allowances            - List allowance types
POST   /api/allowances            - Create allowance type
GET    /api/deductions            - List deduction types
POST   /api/deductions            - Create deduction type
POST   /api/employee-allowances   - Assign allowance to employee
POST   /api/employee-deductions   - Assign deduction to employee
```

#### **Payslips** (Requires Auth)
```
GET    /api/payslips              - List payslips
GET    /api/payslips/:id          - Get payslip details
POST   /api/payslips/generate     - Generate payslips
GET    /api/payslips/:id/download - Download payslip (PDF)
PUT    /api/payslips/:id/send     - Send payslip via email
```

#### **Reports** (Requires Auth)
```
GET    /api/reports               - List available reports
GET    /api/reports/payroll       - Payroll report
GET    /api/reports/attendance    - Attendance report
GET    /api/reports/employees     - Employee report
GET    /api/reports/deductions    - Deductions report
GET    /api/reports/allowances    - Allowances report
POST   /api/reports/custom        - Generate custom report
```

#### **Dashboard** (Requires Auth)
```
GET    /api/dashboard             - Dashboard overview data
GET    /api/dashboard/summary     - Summary metrics
GET    /api/dashboard/charts      - Chart data
```

#### **Settings** (Requires Auth + Admin Role)
```
GET    /api/settings              - Get all settings
PUT    /api/settings              - Update settings
GET    /api/settings/company      - Company information
PUT    /api/settings/company      - Update company info
GET    /api/settings/payroll      - Payroll configuration
PUT    /api/settings/payroll      - Update payroll config
```

### Example Request/Response

**Login Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "user_id": 1,
      "username": "admin",
      "email": "admin@payflow.app",
      "role_id": 1,
      "role_name": "Admin"
    }
  }
}
```

---

## PAGE 3: SECURITY, CONFIGURATION & SUPPORT

### Environment Configuration

**Backend `.env` file:**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=payroll
JWT_SECRET=super-secret-payroll-key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://localhost:5174
```

### Security Features

✓ **Password Security** - Bcryptjs hashing (10 rounds)  
✓ **Authentication** - JWT token-based with expiration  
✓ **Authorization** - Role-based access control (RBAC)  
✓ **CORS** - Whitelist specified origins only  
✓ **Input Validation** - All inputs validated with express-validator  
✓ **SQL Injection Protection** - Parameterized queries  
✓ **Error Handling** - Centralized error handler (no stack traces in production)  
✓ **Audit Logging** - Track all sensitive operations  

### Common Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check DB credentials in `.env`, ensure MySQL running |
| Module not found | Run `npm install` in backend and frontend directories |
| Port already in use | Change PORT in `.env` or kill process using the port |
| Invalid JWT token | Ensure correct Authorization header format: `Bearer <token>` |
| CORS error | Verify CLIENT_URL in `.env` matches frontend URL |
| Vite not found | Run `npm install` in frontend directory |

### Running the Application

**Backend:**
```bash
cd backend
npm install
npm run dev        # Starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

### Payroll Calculation Formula

```
Gross Salary = Basic Salary + Total Allowances + Overtime Pay

Total Deductions = Tax + Pension + Other Deductions

Net Salary = Gross Salary - Total Deductions
```

### Business Logic Flow

1. **Attendance Recording** → Marked daily by employees/HR
2. **Overtime Processing** → Calculated and approved
3. **Payroll Period Setup** → Define start and end dates
4. **Payroll Processing** → System calculates all salaries
5. **Payslip Generation** → Auto-generated and made available
6. **Payment Processing** → Record payment transactions
7. **Report Generation** → Generate for records and analysis

### Contact & Support

- **GitHub Repository:** https://github.com/SamiirAhmed/payrolMs.git
- **Email:** admin@payflow.app
- **Documentation:** See README.md and SYSTEM_DOCUMENTATION.md

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | June 10, 2026 | Initial release |

---

**Document Version:** 1.0.0 | **Pages:** 3 | **Last Updated:** June 10, 2026
