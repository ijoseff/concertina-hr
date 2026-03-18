import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { upsertSchedule } from "@/app/actions/schedules";
import { SubmitButton } from "@/components/ui/submit-button";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AdminSchedulesPage() {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!session || !sessionUser || (sessionUser.role !== "ADMIN" && sessionUser.role !== "MANAGER")) {
    redirect("/");
  }

  // Fetch users and their assigned schedules
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: {
      schedules: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Assign and modify weekly work schedules for all team members.
        </p>
      </div>

      <div className="space-y-8">
        {users.map((user: any) => (
          <div key={user.id} className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-card/50 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-xl text-white">{user.name}</h2>
                <p className="text-sm text-slate-400">{user.email} • {user.role}</p>
              </div>
            </div>
            
            <div className="p-4 bg-[#11131A]">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {DAYS.map((dayName, index) => {
                    const existingSchedule = user.schedules.find((s: any) => s.dayOfWeek === index);
                    
                    return (
                      <div key={dayName} className="bg-[#1A1D27] border border-slate-700/50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
                          {dayName}
                        </div>
                        
                        <form action={async (formData) => {
                           "use server";
                           await upsertSchedule(
                             user.id,
                             index, 
                             formData.get("startTime") as string, 
                             formData.get("endTime") as string
                           );
                        }} className="space-y-2">
                           <div>
                             <input 
                               type="time" 
                               name="startTime" 
                               defaultValue={existingSchedule?.startTime || ""}
                               className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                             />
                           </div>
                           <div className="text-center text-slate-600 text-[10px] leading-none">to</div>
                           <div>
                             <input 
                               type="time" 
                               name="endTime" 
                               defaultValue={existingSchedule?.endTime || ""}
                               className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                             />
                           </div>
                           <SubmitButton variant="default" className="w-full h-7 text-[10px] mt-2 py-0 px-0">
                             {existingSchedule ? 'Update' : 'Set'}
                           </SubmitButton>
                        </form>
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No active team members found.
          </div>
        )}
      </div>
    </div>
  );
}
