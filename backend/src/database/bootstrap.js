const bcrypt = require("bcryptjs");
const { query } = require("../config/database");

async function bootstrapDatabase() {
  await query(`
    INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
    (1, 'Admin', 'System administrator'),
    (2, 'HR Manager', 'Human resource manager'),
    (3, 'Accountant', 'Payroll accountant'),
    (4, 'Employee', 'Regular employee')
  `);

  const passwordHash = await bcrypt.hash("password123", 10);
  await query(
    `
      INSERT INTO users (role_id, username, email, password_hash, status)
      VALUES (1, 'admin', 'admin@payflow.app', ?, 'active')
      ON DUPLICATE KEY UPDATE email = email
    `,
    [passwordHash]
  );

  await query(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INT PRIMARY KEY DEFAULT 1,
      company_name VARCHAR(150) NOT NULL,
      company_email VARCHAR(150) NULL,
      company_phone VARCHAR(50) NULL,
      company_address TEXT NULL,
      company_logo VARCHAR(255) NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS payroll_settings (
      setting_id INT AUTO_INCREMENT PRIMARY KEY,
      default_currency VARCHAR(20) NOT NULL DEFAULT 'USD',
      payroll_cycle VARCHAR(30) NOT NULL DEFAULT 'Monthly',
      default_overtime_rate DECIMAL(10,2) NOT NULL DEFAULT 1.50,
      tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      pension_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await query(`
    INSERT INTO company_settings (id, company_name, company_email, company_phone, company_address)
    VALUES (1, 'PayFlow Holdings Ltd', 'hello@payflow.app', '+254700555222', 'Westlands Business Park, Nairobi')
    ON DUPLICATE KEY UPDATE id = id
  `);

  await query(`
    INSERT INTO payroll_settings (
      default_currency,
      payroll_cycle,
      default_overtime_rate,
      tax_percentage,
      pension_percentage
    )
    SELECT 'USD', 'Monthly', 1.50, 18.00, 6.00
    WHERE NOT EXISTS (SELECT 1 FROM payroll_settings)
  `);
}

module.exports = {
  bootstrapDatabase
};
