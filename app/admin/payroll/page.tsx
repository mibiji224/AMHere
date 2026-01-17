import AdminLayout from '@/app/components/AdminLayout';

export default function PayrollPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Payroll Reports</h1>
        <p className="text-slate-500">Monthly salary summary for all employees.</p>
      </div>

      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
        🚧 <strong>Coming Soon:</strong> This page will show a table of everyone's total earnings for the month.
      </div>
    </AdminLayout>
  );
}