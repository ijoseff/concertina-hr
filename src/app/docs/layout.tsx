import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import Link from "next/link";
import { FileText, FolderPlus, FilePlus } from "lucide-react";
import { createPage } from "@/app/actions/pages";
import { SubmitButton } from "@/components/ui/submit-button";

const prisma = new PrismaClient();

// Helper to build nested tree
function buildTree(pages: any[], parentId: string | null = null): any[] {
  return pages
    .filter((page) => page.parentId === parentId)
    .map((page) => ({
      ...page,
      children: buildTree(pages, page.id),
    }));
}

function PageTreeItem({ page, isAdmin }: { page: any; isAdmin: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center group gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors">
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <Link href={`/docs/${page.slug}`} className="flex-1 truncate font-medium text-foreground/80 hover:text-foreground">
          {page.title}
        </Link>
        {isAdmin && (
          <form action={createPage} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <input type="hidden" name="parentId" value={page.id} />
            <input type="hidden" name="title" value="New Page" />
            <SubmitButton variant="default" className="h-6 w-6 p-0 rounded bg-primary/10 text-primary hover:bg-primary/20">
               <FilePlus className="size-3.5" />
            </SubmitButton>
          </form>
        )}
      </div>
      {page.children && page.children.length > 0 && (
        <div className="ml-4 pl-2 border-l border-border/50 flex flex-col gap-0.5 mt-0.5">
          {page.children.map((child: any) => (
            <PageTreeItem key={child.id} page={child} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as any;
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const allPages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
  });

  const pageTree = buildTree(allPages);

  return (
    <div className="flex h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] border rounded-2xl overflow-hidden bg-card text-card-foreground shadow-sm">
      {/* Docs Sidebar */}
      <aside className="w-64 border-r bg-background/50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between shadow-sm">
          <h2 className="font-semibold text-sm tracking-wide text-muted-foreground uppercase">Knowledge Base</h2>
          {isAdminOrManager && (
            <form action={createPage}>
               <input type="hidden" name="title" value="New Document" />
               <SubmitButton variant="default" className="h-7 px-2 text-xs rounded-md shadow-sm">
                  <FolderPlus className="size-3.5 mr-1.5" /> New
               </SubmitButton>
            </form>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {pageTree.length === 0 ? (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              No pages have been created yet.
            </div>
          ) : (
            pageTree.map((page) => (
              <PageTreeItem key={page.id} page={page} isAdmin={isAdminOrManager} />
            ))
          )}
        </div>
      </aside>

      {/* Docs Content Area */}
      <main className="flex-1 bg-background overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
