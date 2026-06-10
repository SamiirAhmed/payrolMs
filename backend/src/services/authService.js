const bcrypt = require("bcryptjs");
const { query } = require("../config/database");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/jwt");

async function mapUser(identifier) {
  const rows = await query(
    `
      SELECT
        u.user_id,
        u.role_id,
        u.username,
        u.email,
        u.password_hash,
        u.status,
        r.role_name,
        e.employee_id,
        e.first_name,
        e.last_name,
        e.department_id,
        e.position_id
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      LEFT JOIN employees e ON e.user_id = u.user_id
      WHERE u.email = ? OR u.username = ?
      LIMIT 1
    `,
    [identifier, identifier]
  );

  return rows[0] || null;
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    status: user.status,
    role_id: user.role_id,
    role_name: user.role_name,
    employee_id: user.employee_id,
    full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
    department_id: user.department_id,
    position_id: user.position_id
  };
}

async function login(identifier, password) {
  const user = await mapUser(identifier);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({
    userId: user.user_id,
    role: user.role_name
  });

  return {
    token,
    user: sanitizeUser(user)
  };
}

async function getUserById(userId) {
  const rows = await query(
    `
      SELECT
        u.user_id,
        u.role_id,
        u.username,
        u.email,
        u.status,
        r.role_name,
        e.employee_id,
        e.first_name,
        e.last_name,
        e.department_id,
        e.position_id
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      LEFT JOIN employees e ON e.user_id = u.user_id
      WHERE u.user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return sanitizeUser(rows[0]);
}

async function changePassword(userId, currentPassword, newPassword) {
  const rows = await query("SELECT user_id, password_hash FROM users WHERE user_id = ? LIMIT 1", [userId]);
  const user = rows[0];

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!validPassword) {
    throw new AppError("Current password is incorrect", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password_hash = ? WHERE user_id = ?", [passwordHash, userId]);
}

module.exports = {
  login,
  getUserById,
  changePassword
};
