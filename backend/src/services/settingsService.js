const { query } = require("../config/database");

async function getCompanySettings() {
  const rows = await query("SELECT * FROM company_settings WHERE id = 1 LIMIT 1");
  return rows[0];
}

async function updateCompanySettings(payload) {
  await query(
    `
      UPDATE company_settings
      SET company_name = ?, company_email = ?, company_phone = ?, company_address = ?, company_logo = ?
      WHERE id = 1
    `,
    [
      payload.company_name,
      payload.company_email || null,
      payload.company_phone || null,
      payload.company_address || null,
      payload.company_logo || null
    ]
  );
  return getCompanySettings();
}

async function getPayrollSettings() {
  const rows = await query(
    `
      SELECT setting_id, default_currency, payroll_cycle, default_overtime_rate, tax_percentage, pension_percentage
      FROM payroll_settings
      ORDER BY setting_id DESC
      LIMIT 1
    `
  );
  return rows[0];
}

async function updatePayrollSettings(payload) {
  const current = await getPayrollSettings();

  if (current?.setting_id) {
    await query(
      `
        UPDATE payroll_settings
        SET default_currency = ?, payroll_cycle = ?, default_overtime_rate = ?, tax_percentage = ?, pension_percentage = ?
        WHERE setting_id = ?
      `,
      [
        payload.default_currency,
        payload.payroll_cycle,
        payload.default_overtime_rate,
        payload.tax_percentage,
        payload.pension_percentage,
        current.setting_id
      ]
    );
  } else {
    await query(
      `
        INSERT INTO payroll_settings (
          default_currency,
          payroll_cycle,
          default_overtime_rate,
          tax_percentage,
          pension_percentage
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        payload.default_currency,
        payload.payroll_cycle,
        payload.default_overtime_rate,
        payload.tax_percentage,
        payload.pension_percentage
      ]
    );
  }

  return getPayrollSettings();
}

async function getProfile(userId) {
  const rows = await query(
    `
      SELECT user_id, username, email, status
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );
  return rows[0];
}

async function updateProfile(userId, payload) {
  await query("UPDATE users SET username = ?, email = ? WHERE user_id = ?", [
    payload.username,
    payload.email,
    userId
  ]);
  return getProfile(userId);
}

module.exports = {
  getCompanySettings,
  updateCompanySettings,
  getPayrollSettings,
  updatePayrollSettings,
  getProfile,
  updateProfile
};
