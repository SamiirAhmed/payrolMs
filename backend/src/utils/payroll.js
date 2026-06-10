function calculateWorkedHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`1970-01-01T${checkIn}`);
  const end = new Date(`1970-01-01T${checkOut}`);
  const diffHours = (end - start) / (1000 * 60 * 60);
  return diffHours > 0 ? Number(diffHours.toFixed(2)) : 0;
}

function calculateOvertimeAmount(hoursWorked, ratePerHour) {
  return Number((Number(hoursWorked || 0) * Number(ratePerHour || 0)).toFixed(2));
}

module.exports = {
  calculateWorkedHours,
  calculateOvertimeAmount
};
