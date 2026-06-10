# PayFlow Payroll Frontend

Professional React frontend for a Payroll Management System built with:

- React
- React Router
- Tailwind CSS
- Axios
- React Icons
- Recharts
- Context API

## Run locally

1. Install dependencies

```bash
npm install
```

2. Create your environment file

```bash
copy .env.example .env
```

3. Start the development server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
```

## Demo credentials

- Admin: `admin@payflow.app`
- HR Manager: `hr@payflow.app`
- Accountant: `accountant@payflow.app`
- Employee: `employee@payflow.app`
- Password: `password123`

## Backend integration notes

- Update `VITE_API_BASE_URL` in `.env`
- Replace mock service responses in `src/services/*.js` with real axios calls
- Keep `src/services/api.js` as the shared axios instance for auth token and error interceptors
- Use the existing page and form payload structure to map onto your Node.js + Express + MySQL REST endpoints
