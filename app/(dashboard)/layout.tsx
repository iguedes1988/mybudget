import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { DeletionBanner } from "@/components/layout/deletion-banner";
import { EmailVerificationBanner } from "@/components/layout/email-verification-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  // Fetch user preferences for sidebar and banners
  const userPrefs = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      incomeEnabled: true,
      pendingDeletion: true,
      deletionScheduledAt: true,
      emailVerified: true,
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar
        isAdmin={isAdmin}
        hasTeam={!!session.user.teamId}
        incomeEnabled={userPrefs?.incomeEnabled ?? false}
        userName={session.user.name || "User"}
        userEmail={session.user.email || ""}
      />
      <main className="lg:pl-64 flex-1">
        {!userPrefs?.emailVerified && (
          <EmailVerificationBanner />
        )}
        {userPrefs?.pendingDeletion && userPrefs.deletionScheduledAt && (
          <DeletionBanner scheduledAt={userPrefs.deletionScheduledAt} />
        )}
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <div className="lg:pl-64">
        <Footer />
      </div>
    </div>
  );
}
