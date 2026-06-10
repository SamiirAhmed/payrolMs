-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 07, 2026 at 09:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `payroll`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_allowance_type` (IN `p_allowance_name` VARCHAR(150), IN `p_description` TEXT, IN `p_is_taxable` BOOLEAN)   BEGIN
    INSERT INTO allowance_types(allowance_name, description, is_taxable)
    VALUES(p_allowance_name, p_description, p_is_taxable);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_deduction_type` (IN `p_deduction_name` VARCHAR(150), IN `p_description` TEXT, IN `p_is_mandatory` BOOLEAN)   BEGIN
    INSERT INTO deduction_types(deduction_name, description, is_mandatory)
    VALUES(p_deduction_name, p_description, p_is_mandatory);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_department` (IN `p_department_name` VARCHAR(150), IN `p_description` TEXT)   BEGIN
    INSERT INTO departments(department_name, description)
    VALUES(p_department_name, p_description);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_overtime` (IN `p_employee_id` INT, IN `p_overtime_date` DATE, IN `p_hours_worked` DECIMAL(5,2), IN `p_rate_per_hour` DECIMAL(10,2), IN `p_approved_by` INT)   BEGIN
    INSERT INTO overtime_records(
        employee_id, overtime_date, hours_worked, rate_per_hour,
        total_amount, approved_by, status
    )
    VALUES(
        p_employee_id, p_overtime_date, p_hours_worked, p_rate_per_hour,
        (p_hours_worked * p_rate_per_hour), p_approved_by, 'Approved'
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_position` (IN `p_position_name` VARCHAR(150), IN `p_description` TEXT)   BEGIN
    INSERT INTO positions(position_name, description)
    VALUES(p_position_name, p_description);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_assign_employee_allowance` (IN `p_employee_id` INT, IN `p_allowance_type_id` INT, IN `p_amount` DECIMAL(12,2), IN `p_is_recurring` BOOLEAN, IN `p_effective_from` DATE, IN `p_effective_to` DATE)   BEGIN
    INSERT INTO employee_allowances(
        employee_id, allowance_type_id, amount, is_recurring,
        effective_from, effective_to, status
    )
    VALUES(
        p_employee_id, p_allowance_type_id, p_amount, p_is_recurring,
        p_effective_from, p_effective_to, 'Active'
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_assign_employee_deduction` (IN `p_employee_id` INT, IN `p_deduction_type_id` INT, IN `p_amount` DECIMAL(12,2), IN `p_is_recurring` BOOLEAN, IN `p_effective_from` DATE, IN `p_effective_to` DATE)   BEGIN
    INSERT INTO employee_deductions(
        employee_id, deduction_type_id, amount, is_recurring,
        effective_from, effective_to, status
    )
    VALUES(
        p_employee_id, p_deduction_type_id, p_amount, p_is_recurring,
        p_effective_from, p_effective_to, 'Active'
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_change_employee_status` (IN `p_employee_id` INT, IN `p_status` ENUM('Active','Resigned','Terminated','On Leave'))   BEGIN
    UPDATE employees
    SET status = p_status
    WHERE employee_id = p_employee_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_payroll_period` (IN `p_period_name` VARCHAR(100), IN `p_start_date` DATE, IN `p_end_date` DATE)   BEGIN
    INSERT INTO payroll_periods(period_name, start_date, end_date, status)
    VALUES (p_period_name, p_start_date, p_end_date, 'Open');
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generate_payslip` (IN `p_payroll_id` INT, IN `p_issued_by` INT)   BEGIN
    DECLARE v_payslip_number VARCHAR(100);

    SET v_payslip_number = CONCAT('PS-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', p_payroll_id);

    INSERT INTO payslips(
        payroll_id, payslip_number, generated_date, issued_by
    )
    VALUES(
        p_payroll_id, v_payslip_number, NOW(), p_issued_by
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_process_payroll_for_all` (IN `p_period_id` INT, IN `p_processed_by` INT)   BEGIN
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_employee_id INT;

    DECLARE emp_cursor CURSOR FOR
        SELECT employee_id
        FROM employees
        WHERE status = 'Active';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    OPEN emp_cursor;

    payroll_loop: LOOP
        FETCH emp_cursor INTO v_employee_id;

        IF v_done = 1 THEN
            LEAVE payroll_loop;
        END IF;

        CALL sp_process_payroll_for_employee(p_period_id, v_employee_id, p_processed_by);
    END LOOP;

    CLOSE emp_cursor;

    UPDATE payroll_periods
    SET status = 'Closed'
    WHERE period_id = p_period_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_process_payroll_for_employee` (IN `p_period_id` INT, IN `p_employee_id` INT, IN `p_processed_by` INT)   BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    DECLARE v_basic_salary DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_total_allowances DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_total_overtime DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_total_deductions DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_gross_salary DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_net_salary DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_payroll_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT start_date, end_date
    INTO v_start_date, v_end_date
    FROM payroll_periods
    WHERE period_id = p_period_id;

    SELECT basic_salary
    INTO v_basic_salary
    FROM employees
    WHERE employee_id = p_employee_id
      AND status = 'Active';

    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_allowances
    FROM employee_allowances
    WHERE employee_id = p_employee_id
      AND status = 'Active'
      AND effective_from <= v_end_date
      AND (effective_to IS NULL OR effective_to >= v_start_date);

    SELECT COALESCE(SUM(total_amount), 0)
    INTO v_total_overtime
    FROM overtime_records
    WHERE employee_id = p_employee_id
      AND status = 'Approved'
      AND overtime_date BETWEEN v_start_date AND v_end_date;

    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_deductions
    FROM employee_deductions
    WHERE employee_id = p_employee_id
      AND status = 'Active'
      AND effective_from <= v_end_date
      AND (effective_to IS NULL OR effective_to >= v_start_date);

    SET v_gross_salary = v_basic_salary + v_total_allowances + v_total_overtime;
    SET v_net_salary = v_gross_salary - v_total_deductions;

    INSERT INTO payrolls(
        period_id, employee_id, basic_salary, total_allowances,
        total_overtime, total_deductions, gross_salary, net_salary,
        processed_by, processed_date, status
    )
    VALUES(
        p_period_id, p_employee_id, v_basic_salary, v_total_allowances,
        v_total_overtime, v_total_deductions, v_gross_salary, v_net_salary,
        p_processed_by, NOW(), 'Approved'
    )
    ON DUPLICATE KEY UPDATE
        basic_salary = VALUES(basic_salary),
        total_allowances = VALUES(total_allowances),
        total_overtime = VALUES(total_overtime),
        total_deductions = VALUES(total_deductions),
        gross_salary = VALUES(gross_salary),
        net_salary = VALUES(net_salary),
        processed_by = VALUES(processed_by),
        processed_date = VALUES(processed_date),
        status = VALUES(status);

    SELECT payroll_id
    INTO v_payroll_id
    FROM payrolls
    WHERE period_id = p_period_id
      AND employee_id = p_employee_id;

    DELETE FROM payroll_details
    WHERE payroll_id = v_payroll_id;

    INSERT INTO payroll_details(payroll_id, item_type, item_name, amount, remarks)
    VALUES(v_payroll_id, 'Basic', 'Basic Salary', v_basic_salary, 'Monthly basic salary');

    INSERT INTO payroll_details(payroll_id, item_type, item_name, amount, remarks)
    VALUES(v_payroll_id, 'Allowance', 'Total Allowances', v_total_allowances, 'Employee allowances');

    INSERT INTO payroll_details(payroll_id, item_type, item_name, amount, remarks)
    VALUES(v_payroll_id, 'Overtime', 'Total Overtime', v_total_overtime, 'Approved overtime');

    INSERT INTO payroll_details(payroll_id, item_type, item_name, amount, remarks)
    VALUES(v_payroll_id, 'Deduction', 'Total Deductions', v_total_deductions, 'Employee deductions');

    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_record_payment` (IN `p_payroll_id` INT, IN `p_payment_date` DATETIME, IN `p_payment_method` ENUM('Bank','Cash','Mobile Money'), IN `p_reference_number` VARCHAR(100), IN `p_amount_paid` DECIMAL(12,2), IN `p_payment_status` ENUM('Pending','Completed','Failed'), IN `p_received_by` VARCHAR(150))   BEGIN
    INSERT INTO payments(
        payroll_id, payment_date, payment_method, reference_number,
        amount_paid, payment_status, received_by
    )
    VALUES(
        p_payroll_id, p_payment_date, p_payment_method, p_reference_number,
        p_amount_paid, p_payment_status, p_received_by
    );

    IF p_payment_status = 'Completed' THEN
        UPDATE payrolls
        SET status = 'Paid'
        WHERE payroll_id = p_payroll_id;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_attendance` (IN `p_employee_id` INT, IN `p_attendance_date` DATE, IN `p_check_in_time` TIME, IN `p_check_out_time` TIME, IN `p_status` ENUM('Present','Absent','Late','Half-day','Leave'), IN `p_remarks` TEXT)   BEGIN
    DECLARE v_worked_hours DECIMAL(5,2);

    IF p_check_in_time IS NOT NULL AND p_check_out_time IS NOT NULL THEN
        SET v_worked_hours = TIME_TO_SEC(TIMEDIFF(p_check_out_time, p_check_in_time)) / 3600;
    ELSE
        SET v_worked_hours = 0.00;
    END IF;

    INSERT INTO attendance(
        employee_id, attendance_date, check_in_time, check_out_time,
        status, worked_hours, remarks
    )
    VALUES(
        p_employee_id, p_attendance_date, p_check_in_time, p_check_out_time,
        p_status, v_worked_hours, p_remarks
    )
    ON DUPLICATE KEY UPDATE
        check_in_time = VALUES(check_in_time),
        check_out_time = VALUES(check_out_time),
        status = VALUES(status),
        worked_hours = VALUES(worked_hours),
        remarks = VALUES(remarks);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `allowance_types`
--

CREATE TABLE `allowance_types` (
  `allowance_type_id` int(11) NOT NULL,
  `allowance_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_taxable` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `allowance_types`
--

INSERT INTO `allowance_types` (`allowance_type_id`, `allowance_name`, `description`, `is_taxable`) VALUES
(1, 'caafimaad', 'waa caafimaad', 1),
(2, 'Housing allowance', 'Housing allowance', 1),
(3, 'Transport allowance', 'Transport allowance', 1);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `status` enum('Present','Absent','Late','Half-day','Leave') NOT NULL,
  `worked_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `employee_id`, `attendance_date`, `check_in_time`, `check_out_time`, `status`, `worked_hours`, `remarks`) VALUES
(2, 1, '2026-04-25', '21:41:00', '21:48:00', 'Present', 0.12, NULL),
(3, 2, '2026-05-07', '22:07:00', '03:13:00', 'Absent', 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `company_settings`
--

CREATE TABLE `company_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `company_name` varchar(150) NOT NULL,
  `company_email` varchar(150) DEFAULT NULL,
  `company_phone` varchar(50) DEFAULT NULL,
  `company_address` text DEFAULT NULL,
  `company_logo` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_settings`
--

INSERT INTO `company_settings` (`id`, `company_name`, `company_email`, `company_phone`, `company_address`, `company_logo`, `updated_at`) VALUES
(1, 'Himillo University', 'hemilo@edu.com', '+252615555555', 'Mogadishu, Somalia', NULL, '2026-04-25 16:47:03');

-- --------------------------------------------------------

--
-- Table structure for table `deduction_types`
--

CREATE TABLE `deduction_types` (
  `deduction_type_id` int(11) NOT NULL,
  `deduction_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deduction_types`
--

INSERT INTO `deduction_types` (`deduction_type_id`, `deduction_name`, `description`, `is_mandatory`) VALUES
(1, 'Deduction ', 'mbsm,', 0),
(2, 'Penalties', 'Penalties', 0),
(3, 'Loan repayments', 'Loan repayments', 0);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `description`) VALUES
(2, 'Sales', ' wax iibinta'),
(3, 'HR', 'SDDS'),
(4, 'Acadmic', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `hire_date` date NOT NULL,
  `employment_type` enum('Full-time','Part-time','Contract') NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `basic_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('Active','Resigned','Terminated','On Leave') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `user_id`, `department_id`, `position_id`, `employee_code`, `first_name`, `last_name`, `gender`, `phone`, `email`, `address`, `hire_date`, `employment_type`, `bank_name`, `account_number`, `basic_salary`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 2, 1, '000001', 'Mohamed', 'Muhudiin', 'Male', '615843794', 'm.m.dhegacadde@gmail.com', 'Mogadishu', '2026-04-25', 'Full-time', 'Salam Back', '40563487', 300.00, 'Active', '2026-04-25 16:08:44', '2026-04-25 16:08:44'),
(2, NULL, 3, 3, '000002', 'Mohamed ', 'Saleman', 'Male', '6657890809', 'moha@gamil.com', 'Mogadishu', '2026-05-06', 'Full-time', 'Salam Back', '8979873', 300.00, 'Active', '2026-05-07 19:03:55', '2026-05-07 19:04:21');

-- --------------------------------------------------------

--
-- Table structure for table `employee_allowances`
--

CREATE TABLE `employee_allowances` (
  `employee_allowance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `allowance_type_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 1,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_allowances`
--

INSERT INTO `employee_allowances` (`employee_allowance_id`, `employee_id`, `allowance_type_id`, `amount`, `is_recurring`, `effective_from`, `effective_to`, `status`) VALUES
(1, 1, 1, 38.00, 1, '2026-04-01', '2026-04-30', 'Active'),
(2, 1, 2, 38.00, 1, '2026-04-01', '2026-04-30', 'Active'),
(3, 2, 2, 20.00, 1, '2026-05-08', '2026-05-24', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `employee_deductions`
--

CREATE TABLE `employee_deductions` (
  `employee_deduction_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `deduction_type_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 1,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_deductions`
--

INSERT INTO `employee_deductions` (`employee_deduction_id`, `employee_id`, `deduction_type_id`, `amount`, `is_recurring`, `effective_from`, `effective_to`, `status`) VALUES
(1, 1, 1, 17.00, 1, '2026-04-01', '2026-04-30', 'Active'),
(2, 1, 3, 10.00, 1, '2026-04-01', '2026-04-30', 'Active'),
(3, 2, 3, 10.00, 1, '2026-05-29', '2026-05-31', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `overtime_records`
--

CREATE TABLE `overtime_records` (
  `overtime_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `overtime_date` date NOT NULL,
  `hours_worked` decimal(5,2) NOT NULL DEFAULT 0.00,
  `rate_per_hour` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `approved_by` int(11) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `overtime_records`
--

INSERT INTO `overtime_records` (`overtime_id`, `employee_id`, `overtime_date`, `hours_worked`, `rate_per_hour`, `total_amount`, `approved_by`, `status`) VALUES
(1, 1, '2026-04-25', 2.00, 1.50, 3.00, NULL, 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `payment_date` datetime NOT NULL,
  `payment_method` enum('Bank','Cash','Mobile Money') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('Pending','Completed','Failed') NOT NULL DEFAULT 'Pending',
  `received_by` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `payroll_id`, `payment_date`, `payment_method`, `reference_number`, `amount_paid`, `payment_status`, `received_by`) VALUES
(1, 2, '2026-04-26 00:00:00', 'Bank', '000001', 750.00, 'Completed', '1'),
(2, 3, '2026-05-07 00:00:00', 'Bank', '10000', 300.00, 'Pending', '1');

-- --------------------------------------------------------

--
-- Table structure for table `payrolls`
--

CREATE TABLE `payrolls` (
  `payroll_id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_allowances` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_overtime` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_deductions` decimal(12,2) NOT NULL DEFAULT 0.00,
  `gross_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime DEFAULT NULL,
  `status` enum('Draft','Approved','Paid') NOT NULL DEFAULT 'Draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payrolls`
--

INSERT INTO `payrolls` (`payroll_id`, `period_id`, `employee_id`, `basic_salary`, `total_allowances`, `total_overtime`, `total_deductions`, `gross_salary`, `net_salary`, `processed_by`, `processed_date`, `status`) VALUES
(2, 1, 1, 700.00, 76.00, 3.00, 27.00, 779.00, 752.00, 1, '2026-04-25 21:42:56', 'Paid'),
(3, 2, 2, 300.00, 20.00, 0.00, 10.00, 320.00, 310.00, 1, '2026-05-07 22:09:12', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_details`
--

CREATE TABLE `payroll_details` (
  `payroll_detail_id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `item_type` enum('Basic','Allowance','Deduction','Overtime') NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_details`
--

INSERT INTO `payroll_details` (`payroll_detail_id`, `payroll_id`, `item_type`, `item_name`, `amount`, `remarks`) VALUES
(9, 2, 'Basic', 'Basic Salary', 700.00, 'From active salary structure'),
(10, 2, 'Allowance', 'Employee Allowances', 76.00, 'Active employee allowances'),
(11, 2, 'Overtime', 'Approved Overtime', 3.00, 'Approved overtime within the payroll period'),
(12, 2, 'Deduction', 'Employee Deductions', 27.00, 'Active employee deductions'),
(13, 3, 'Basic', 'Basic Salary', 300.00, 'From active salary structure'),
(14, 3, 'Allowance', 'Employee Allowances', 20.00, 'Active employee allowances'),
(15, 3, 'Overtime', 'Approved Overtime', 0.00, 'Approved overtime within the payroll period'),
(16, 3, 'Deduction', 'Employee Deductions', 10.00, 'Active employee deductions');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_periods`
--

CREATE TABLE `payroll_periods` (
  `period_id` int(11) NOT NULL,
  `period_name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Open','Processing','Closed') NOT NULL DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_periods`
--

INSERT INTO `payroll_periods` (`period_id`, `period_name`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(1, 'Aprill 2026', '2026-04-22', '2026-05-22', 'Open', '2026-04-23 16:26:05'),
(2, 'may 2026', '2026-05-01', '2026-05-31', 'Open', '2026-05-07 19:08:41');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_settings`
--

CREATE TABLE `payroll_settings` (
  `setting_id` int(11) NOT NULL,
  `default_currency` varchar(10) DEFAULT NULL,
  `payroll_cycle` enum('Monthly','Weekly','Biweekly') DEFAULT NULL,
  `default_overtime_rate` decimal(5,2) DEFAULT NULL,
  `tax_percentage` decimal(5,2) DEFAULT NULL,
  `pension_percentage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_settings`
--

INSERT INTO `payroll_settings` (`setting_id`, `default_currency`, `payroll_cycle`, `default_overtime_rate`, `tax_percentage`, `pension_percentage`, `created_at`, `updated_at`) VALUES
(1, 'USD', 'Monthly', 1.50, 6.00, 18.00, '2026-04-25 17:09:30', '2026-04-25 17:09:30');

-- --------------------------------------------------------

--
-- Table structure for table `payslips`
--

CREATE TABLE `payslips` (
  `payslip_id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `payslip_number` varchar(100) NOT NULL,
  `generated_date` datetime NOT NULL DEFAULT current_timestamp(),
  `file_path` varchar(255) DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payslips`
--

INSERT INTO `payslips` (`payslip_id`, `payroll_id`, `payslip_number`, `generated_date`, `file_path`, `issued_by`) VALUES
(1, 2, 'PS-20260425-2', '2026-04-25 21:43:21', NULL, 1),
(2, 3, 'PS-20260507-3', '2026-05-07 22:10:20', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `position_id` int(11) NOT NULL,
  `position_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`position_id`, `position_name`, `description`) VALUES
(1, 'salesMan', 'wax iibiye'),
(2, 'cashier', NULL),
(3, 'Manager', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'Admin', 'System administrator'),
(2, 'HR Manager', 'Human resource manager'),
(3, 'Accountant', 'Payroll accountant'),
(4, 'Employee', 'Regular employee');

-- --------------------------------------------------------

--
-- Table structure for table `salary_structures`
--

CREATE TABLE `salary_structures` (
  `salary_structure_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `house_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `transport_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `medical_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `pension_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `effective_from` date NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_structures`
--

INSERT INTO `salary_structures` (`salary_structure_id`, `employee_id`, `basic_salary`, `house_allowance`, `transport_allowance`, `medical_allowance`, `other_allowance`, `tax_percentage`, `pension_percentage`, `effective_from`, `status`) VALUES
(5, 1, 700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-04-30', 'Active'),
(6, 2, 300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-05-07', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `tax_settings`
--

CREATE TABLE `tax_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `tax_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `pension_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role_id`, `username`, `email`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin', 'admin@gmail.ocm', '$2a$10$VBOHMC.lKVN/sAuDHljpceU.vojz327MtjZKiGs3qGlgk0EVn3kFW', 'active', '2026-04-21 17:37:11', '2026-05-07 19:15:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allowance_types`
--
ALTER TABLE `allowance_types`
  ADD PRIMARY KEY (`allowance_type_id`),
  ADD UNIQUE KEY `allowance_name` (`allowance_name`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uq_attendance_employee_date` (`employee_id`,`attendance_date`);

--
-- Indexes for table `company_settings`
--
ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deduction_types`
--
ALTER TABLE `deduction_types`
  ADD PRIMARY KEY (`deduction_type_id`),
  ADD UNIQUE KEY `deduction_name` (`deduction_name`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_employees_user` (`user_id`),
  ADD KEY `fk_employees_department` (`department_id`),
  ADD KEY `fk_employees_position` (`position_id`);

--
-- Indexes for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  ADD PRIMARY KEY (`employee_allowance_id`),
  ADD KEY `fk_employee_allowances_employee` (`employee_id`),
  ADD KEY `fk_employee_allowances_type` (`allowance_type_id`);

--
-- Indexes for table `employee_deductions`
--
ALTER TABLE `employee_deductions`
  ADD PRIMARY KEY (`employee_deduction_id`),
  ADD KEY `fk_employee_deductions_employee` (`employee_id`),
  ADD KEY `fk_employee_deductions_type` (`deduction_type_id`);

--
-- Indexes for table `overtime_records`
--
ALTER TABLE `overtime_records`
  ADD PRIMARY KEY (`overtime_id`),
  ADD KEY `fk_overtime_employee` (`employee_id`),
  ADD KEY `fk_overtime_approved_by` (`approved_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `fk_payments_payroll` (`payroll_id`);

--
-- Indexes for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`payroll_id`),
  ADD UNIQUE KEY `uq_payroll_employee_period` (`period_id`,`employee_id`),
  ADD KEY `fk_payrolls_employee` (`employee_id`),
  ADD KEY `fk_payrolls_processed_by` (`processed_by`);

--
-- Indexes for table `payroll_details`
--
ALTER TABLE `payroll_details`
  ADD PRIMARY KEY (`payroll_detail_id`),
  ADD KEY `fk_payroll_details_payroll` (`payroll_id`);

--
-- Indexes for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  ADD PRIMARY KEY (`period_id`),
  ADD UNIQUE KEY `period_name` (`period_name`);

--
-- Indexes for table `payroll_settings`
--
ALTER TABLE `payroll_settings`
  ADD PRIMARY KEY (`setting_id`);

--
-- Indexes for table `payslips`
--
ALTER TABLE `payslips`
  ADD PRIMARY KEY (`payslip_id`),
  ADD UNIQUE KEY `payslip_number` (`payslip_number`),
  ADD KEY `fk_payslips_payroll` (`payroll_id`),
  ADD KEY `fk_payslips_issued_by` (`issued_by`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`position_id`),
  ADD UNIQUE KEY `position_name` (`position_name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `salary_structures`
--
ALTER TABLE `salary_structures`
  ADD PRIMARY KEY (`salary_structure_id`),
  ADD KEY `fk_salary_structures_employee` (`employee_id`);

--
-- Indexes for table `tax_settings`
--
ALTER TABLE `tax_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `allowance_types`
--
ALTER TABLE `allowance_types`
  MODIFY `allowance_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deduction_types`
--
ALTER TABLE `deduction_types`
  MODIFY `deduction_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  MODIFY `employee_allowance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_deductions`
--
ALTER TABLE `employee_deductions`
  MODIFY `employee_deduction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `overtime_records`
--
ALTER TABLE `overtime_records`
  MODIFY `overtime_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `payroll_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payroll_details`
--
ALTER TABLE `payroll_details`
  MODIFY `payroll_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  MODIFY `period_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payroll_settings`
--
ALTER TABLE `payroll_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payslips`
--
ALTER TABLE `payslips`
  MODIFY `payslip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `position_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `salary_structures`
--
ALTER TABLE `salary_structures`
  MODIFY `salary_structure_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employees_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  ADD CONSTRAINT `fk_employee_allowances_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employee_allowances_type` FOREIGN KEY (`allowance_type_id`) REFERENCES `allowance_types` (`allowance_type_id`) ON UPDATE CASCADE;

--
-- Constraints for table `employee_deductions`
--
ALTER TABLE `employee_deductions`
  ADD CONSTRAINT `fk_employee_deductions_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employee_deductions_type` FOREIGN KEY (`deduction_type_id`) REFERENCES `deduction_types` (`deduction_type_id`) ON UPDATE CASCADE;

--
-- Constraints for table `overtime_records`
--
ALTER TABLE `overtime_records`
  ADD CONSTRAINT `fk_overtime_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_overtime_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`payroll_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `fk_payrolls_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payrolls_period` FOREIGN KEY (`period_id`) REFERENCES `payroll_periods` (`period_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payrolls_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payroll_details`
--
ALTER TABLE `payroll_details`
  ADD CONSTRAINT `fk_payroll_details_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`payroll_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payslips`
--
ALTER TABLE `payslips`
  ADD CONSTRAINT `fk_payslips_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payslips_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`payroll_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `salary_structures`
--
ALTER TABLE `salary_structures`
  ADD CONSTRAINT `fk_salary_structures_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
