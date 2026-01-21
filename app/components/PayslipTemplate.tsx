import React from 'react';

export default function PayslipTemplate({ 
  employee, 
  totalHours, 
  totalEarnings, 
  history 
}: { 
  employee: any, 
  totalHours: number, 
  totalEarnings: number, 
  history: any[] 
}) {
  const currentDate = new Date().toLocaleDateString();

  return (
    <div id="payslip-container" className="p-8 max-w-2xl mx-auto bg-white text-black font-mono text-sm">
      
      {/* Receipt Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">OFFICIAL PAYSLIP</h1>
        <p className="text-sm mt-1">AMHere Management System</p>
        <p className="text-xs text-gray-500 mt-1">Date: {currentDate}</p>
      </div>

      {/* Employee Info Box */}
      <div className="border border-black p-4 mb-6">
        <div className="flex justify-between mb-1">
          <span className="font-bold">Name:</span>
          <span className="uppercase">{employee.firstName} {employee.lastName}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-bold">ID:</span>
          <span>{employee.employeeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Position:</span>
          <span>{employee.position}</span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mb-8">
        <h3 className="font-bold border-b border-black mb-2 pb-1">SUMMARY</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1">Hourly Rate</td>
              <td className="text-right py-1">${employee.hourlyRate.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-1">Total Hours</td>
              <td className="text-right py-1">{totalHours.toFixed(2)} hrs</td>
            </tr>
            <tr className="font-bold text-lg border-t border-black border-dashed">
              <td className="pt-2">NET PAY</td>
              <td className="text-right pt-2">${totalEarnings.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 👇 NEW SECTION: ATTENDANCE HISTORY */}
      <div className="mb-8">
        <h3 className="font-bold border-b border-black mb-2 pb-1">ATTENDANCE DETAIL</h3>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="py-1 w-1/4">Date</th>
              <th className="py-1 w-1/4">In</th>
              <th className="py-1 w-1/4">Out</th>
              <th className="py-1 w-1/4 text-right">Hrs</th>
            </tr>
          </thead>
          <tbody>
            {history.map((log) => (
              <tr key={log.id} className="border-b border-gray-200">
                <td className="py-1">
                  {new Date(log.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </td>
                <td className="py-1">
                  {log.timeIn ? new Date(log.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="py-1">
                  {log.timeOut ? new Date(log.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="py-1 text-right">
                  {log.dailyHours > 0 ? log.dailyHours.toFixed(2) : '-'}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-12 pt-8 text-xs">
        <div className="text-center">
          <div className="border-t border-black w-32 mb-2"></div>
          <p>Employer Signature</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-32 mb-2"></div>
          <p>Employee Signature</p>
        </div>
      </div>
      
      <div className="text-center text-[10px] mt-8 italic text-gray-400">
        Generated via AM-HERE System
      </div>
    </div>
  );
}