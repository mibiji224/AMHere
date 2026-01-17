'use client'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-2 shadow-sm print:hidden"
    >
      🖨️ Print Payslip
    </button>
  );
}