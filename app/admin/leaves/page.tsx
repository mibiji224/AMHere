import AdminLayout from '@/app/components/AdminLayout';

export default function LeavePage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>
        <p className="text-slate-500">Approve or reject time-off requests.</p>
      </div>

      <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
        <p className="text-gray-400">No pending leave requests found.</p>
      </div>
    </AdminLayout>
  );
}