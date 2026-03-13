import Link from "next/link";

// Auth pages use client-side Supabase — opt out of static prerendering.
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">IR</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">Inferno Repair</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center py-12 px-4 min-h-[calc(100vh-64px)]">
        {children}
      </div>
    </div>
  );
}