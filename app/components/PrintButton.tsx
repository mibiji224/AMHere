'use client'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-foreground text-background px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg print:hidden"
    >
      Print Payslip
    </button>
  );
}