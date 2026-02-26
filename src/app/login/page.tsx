import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Concertina HR</h1>
                    <p className="text-sm text-muted-foreground mt-2">Sign in to manage your time and leaves.</p>
                </div>

                <form
                    action={async (formData) => {
                        "use server";
                        await signIn("credentials", formData);
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            placeholder="employee@concertinahr.local"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            placeholder="Enter any password for demo"
                        />
                    </div>
                    <SubmitButton className="w-full">
                        Sign In
                    </SubmitButton>
                </form>

                <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Accounts Available</p>
                    <div className="grid gap-1 text-[11px] text-muted-foreground">
                        <p>admin@concertinahr.local</p>
                        <p>manager@concertinahr.local</p>
                        <p>employee@concertinahr.local</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
