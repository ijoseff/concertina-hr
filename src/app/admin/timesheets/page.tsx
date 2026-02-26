import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function AdminTimesheetsPage() {
    const session = await auth();
    const user = session?.user as any;
    if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        redirect("/login");
    }

    const timeLogs = await prisma.timeLog.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { clockIn: "desc" },
        take: 100, // Show last 100 logs across the company
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Company Time Logs</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Monitor attendance and clock events across all employees.
                </p>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Clock In</th>
                                <th className="px-6 py-4 font-semibold">Clock Out</th>
                                <th className="px-6 py-4 font-semibold">Duration</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {timeLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No active time logs found across the company.
                                    </td>
                                </tr>
                            ) : (
                                timeLogs.map((log: any) => {
                                    let duration = "-";
                                    if (log.clockOut) {
                                        const diffMs = log.clockOut.getTime() - log.clockIn.getTime();
                                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                        duration = `${diffHrs}h ${diffMins}m`;
                                    }

                                    return (
                                        <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{log.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {format(log.clockIn, "MMM d, yyyy")}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {format(log.clockIn, "h:mm a")}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {log.clockOut ? format(log.clockOut, "h:mm a") : <span className="text-primary italic animate-pulse font-semibold">Active</span>}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {duration}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${log.status === 'ON_TIME'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}>
                                                    {log.status === 'ON_TIME' ? 'On Time' : 'Late'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
