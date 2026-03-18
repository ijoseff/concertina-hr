import { BookOpen } from "lucide-react";

export default function DocsIndexPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                <BookOpen className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Concertina Knowledge Base</h1>
            <p className="text-muted-foreground max-w-md">
                Select a document from the sidebar to start reading company policies, SOPs, and guides.
            </p>
        </div>
    );
}
