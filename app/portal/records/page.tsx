import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';

export default async function RecordsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;

  const attendance = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30 // Show last 30 entries
  });

  return (
    <EmployeeLayout>
      <div className="space-y-8 pt-15">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Records</h1>
          <p className="text-muted-foreground">Your attendance history for the last 30 days.</p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary text-muted-foreground font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time In</th>
                <th className="px-6 py-4">Time Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-secondary/50 transition">
                  <td className="px-6 py-4 font-bold">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-green-600">
                    {new Date(record.timeIn).toLocaleTimeString([], {timeStyle: 'short'})}
                  </td>
                  <td className="px-6 py-4 text-red-600">
                    {record.timeOut ? new Date(record.timeOut).toLocaleTimeString([], {timeStyle: 'short'}) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
}