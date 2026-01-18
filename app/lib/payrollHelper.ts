export function calculatePayroll(employee: any, startDate: Date, endDate: Date) {
  let totalHours = 0;
  let totalDeduction = 0;
  const hourlyRate = employee.hourlyRate.toNumber();
  const ratePerMinute = hourlyRate / 60;

  const weeklyLogs = employee.attendance.filter((log: any) => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });

  weeklyLogs.forEach((record: any) => {
    if (record.timeIn && record.timeOut) {
      const start = new Date(record.timeIn).getTime();
      const end = new Date(record.timeOut).getTime();
      
      // 1. Calculate Break
      let breakMinutes = 0;
      if (record.breakStart && record.breakEnd) {
        breakMinutes = (new Date(record.breakEnd).getTime() - new Date(record.breakStart).getTime()) / 60000;
      }

      // 2. Break Deduction (If > 60 mins)
      let deductionAmount = 0;
      if (breakMinutes > 60) {
        const excessMinutes = breakMinutes - 60;
        deductionAmount = excessMinutes * ratePerMinute;
      }
      totalDeduction += deductionAmount;

      // 3. Work Hours (Subtract ACTUAL break time from duration)
      // Note: We subtract the full break time from the hours worked
      const rawWorkMinutes = ((end - start) / 60000) - breakMinutes;
      const hours = Math.max(0, rawWorkMinutes / 60);
      
      totalHours += hours;
    }
  });

  const grossPay = totalHours * hourlyRate;
  const netPay = grossPay - totalDeduction;

  return {
    totalHours,
    totalDeduction,
    grossPay,
    netPay,
    logCount: weeklyLogs.length
  };
}