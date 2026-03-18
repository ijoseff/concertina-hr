"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updatePageContent, deletePage } from "@/app/actions/pages";
import { Trash2, Save, MoreVertical, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DocViewerPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Local state for the WYSIWYG editor
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const isAdminOrManager = session?.user && ((session.user as any).role === "ADMIN" || (session.user as any).role === "MANAGER");

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/docs?slug=${params.slug}`);
        if (!res.ok) throw new Error("Not Found");
        const data = await res.json();
        setPage(data);
        setTitle(data.title);
        setContent(data.content || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [params.slug]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground w-full h-full">
         <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground w-full h-full text-center">
         <div>
            <p className="font-semibold text-lg text-foreground">Document not found.</p>
            <p className="text-sm">It may have been deleted or the URL is incorrect.</p>
         </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePageContent(page.id, title, content);
      router.refresh(); // Refresh Sidebar
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete this document and all of its sub-pages?")) return;
    await deletePage(page.id);
    router.push("/docs");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-12 animate-in fade-in duration-300">
      
      {/* Title & Actions Navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {isAdminOrManager ? (
            <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title"
                className="text-4xl font-extrabold tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground w-full flex-1"
            />
        ) : (
            <h1 className="text-4xl font-extrabold tracking-tight w-full flex-1">{page.title}</h1>
        )}

        {isAdminOrManager && (
            <div className="flex items-center gap-2 shrink-0">
                <button 
                    type="button"
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-destructive shrink-0 rounded-md transition-colors"
                    onClick={handleDelete}
                    title="Delete Page"
                >
                    <Trash2 className="size-4" />
                </button>
                <button 
                    type="button"
                    onClick={handleSave} 
                    disabled={saving || (title === page.title && content === page.content)}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-md shrink-0 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        )}
      </div>

      {/* Editor / Viewer Body */}
      {isAdminOrManager ? (
          <div className="ring-1 ring-border rounded-lg shadow-sm">
             <RichTextEditor content={content} onChange={setContent} editable={true} />
          </div>
      ) : (
           <div 
             className="prose prose-sm dark:prose-invert sm:prose-base max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:underline mt-4"
             dangerouslySetInnerHTML={{ __html: page.content || "<p class='text-muted-foreground italic'>This document is empty.</p>" }}
           />
      )}
      
      {/* Footer Info */}
      <div className="mt-16 pt-8 border-t border-border/40 text-xs text-muted-foreground flex justify-between items-center">
         <span>Last updated by <span className="font-medium">{page.author?.name || "Unknown"}</span></span>
         <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
