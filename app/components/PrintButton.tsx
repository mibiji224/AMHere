'use client'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 border border-border print:hidden"
    >
      🖨 Print Payslip
    </button>
  );
}