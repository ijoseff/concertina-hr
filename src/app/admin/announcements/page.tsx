import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { createAnnouncement, deleteAnnouncement } from "@/app/actions/announcements";
import { SubmitButton } from "@/components/ui/submit-button";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
    const session = await auth();
    const user = session?.user as any;
    if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        redirect("/login");
    }

    const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        include: { author: true },
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Company Announcements</h1>
                <p className="text-muted-foreground">
                    Broadcast news, events, and updates to all employees on the Concertina HR dashboard.
                </p>
            </div>

            {/* Compose New Announcement */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
                </div>
                <h2 className="font-semibold text-xl mb-6 relative">Post New Update</h2>

                <form action={createAnnouncement} className="space-y-4 relative">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">Title / Headline</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Townhall Meeting This Friday"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium">Message Body</label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={5}
                            placeholder="Write the full announcement here..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <SubmitButton className="w-full sm:w-auto mt-2">
                        Publish Announcement
                    </SubmitButton>
                </form>
            </div>

            {/* Existing Announcements List */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">Past Announcements</h2>
                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No announcements have been made yet.</p>
                    ) : (
                        announcements.map((announcement: any) => (
                            <div key={announcement.id} className="relative p-5 rounded-xl border bg-background/50 flex flex-col sm:flex-row gap-4 justify-between items-start group transition-all hover:border-primary/20">
                                <div className="space-y-1 w-full">
                                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2">
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{announcement.author.name}</span>
                                        <span>•</span>
                                        <span>{format(announcement.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{announcement.content}</p>
                                </div>
                                
                                <form action={deleteAnnouncement.bind(null, announcement.id)} className="w-full sm:w-auto flex justify-end">
                                    <SubmitButton 
                                        variant="destructive" 
                                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    >
                                        Delete
                                    </SubmitButton>
                                </form>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
