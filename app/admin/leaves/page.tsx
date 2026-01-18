import AdminLayout from '@/app/components/AdminLayout';
import { prisma } from '@/app/lib/prisma';
import { approveLeave, rejectLeave, createTestRequest } from './actions';

export const dynamic = 'force-dynamic';

export default async function LeavePage() {
  // 1. Fetch Requests sorted by newest first
  const leaves = await prisma.leaveRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const pending = leaves.filter(l => l.status === 'PENDING');
  const history = leaves.filter(l => l.status !== 'PENDING');

  // Helper to get the first employee ID for the "Test Button"
  const firstEmployee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' }});

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground">Manage employee time-off applications.</p>
        </div>

        {/* TEST BUTTON: Only shows if you have employees but no requests yet */}
        {pending.length === 0 && history.length === 0 && firstEmployee && (
            <form action={async () => {
                'use server'
                await createTestRequest(firstEmployee.id)
            }}>
                <button className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-200 transition">
                    + Generate Test Request
                </button>
            </form>
        )}
      </div>

      {/* SECTION 1: PENDING REQUESTS */}
      <div className="mb-10">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
            ⏳ Pending Approval 
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
        </h2>

        {pending.length > 0 ? (
            <div className="grid gap-4">
                {pending.map(req => (
                    <div key={req.id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 flex items-center justify-center font-bold text-lg">
                                {req.user.firstName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{req.user.firstName} {req.user.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{req.user.position}</p>
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <div className="text-sm font-bold text-foreground">
                                {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground italic mt-1">
                                "{req.reason}"
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <form action={approveLeave.bind(null, req.id)}>
                                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm">
                                    Approve
                                </button>
                            </form>
                            <form action={rejectLeave.bind(null, req.id)}>
                                <button className="bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition border border-gray-200 dark:border-gray-700">
                                    Reject
                                </button>
                            </form>
                        </div>

                    </div>
                ))}
            </div>
        ) : (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground bg-gray-50/50 dark:bg-gray-900/20">
                No pending requests right now.
            </div>
        )}
      </div>

      {/* SECTION 2: HISTORY */}
      <div>
        <h2 className="font-bold text-lg mb-4 text-foreground">📜 History</h2>
        
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-medium">Employee</th>
                            <th className="px-6 py-3 font-medium">Dates</th>
                            <th className="px-6 py-3 font-medium">Reason</th>
                            <th className="px-6 py-3 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {history.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">
                                    {req.user.firstName} {req.user.lastName}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground italic">
                                    {req.reason}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === 'APPROVED' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                            Rejected
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                                    No history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

    </AdminLayout>
  );
}