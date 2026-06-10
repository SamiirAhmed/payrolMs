# Payroll Backend

Clean Node.js + Express backend for the Payroll Management System.

## Stack

- Node.js
- Express.js
- MySQL
- mysql2
- JWT authentication
- bcryptjs
- express-validator

## Run locally

1. Copy environment variables

```bash
copy .env.example .env
```

2. Update MySQL credentials in `.env`

3. Install dependencies

```bash
npm install
```

4. Start the server

```bash
npm run dev
```

## Main API groups

- `/api/auth`
- `/api/dashboard`
- `/api/employees`
- `/api/attendance`
- `/api/payroll`
- `/api/reports`
- `/api/settings`

## Notes

- The backend expects the existing `payroll` MySQL schema to already exist.
- On startup it also creates simple settings tables if they are missing.
- JWT must be sent as `Authorization: Bearer <token>`.
