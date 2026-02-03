import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const existingSalon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  if (existingSalon) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-subtle" />

      <div className="w-full max-w-[420px] relative">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight mb-2">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          <h1 className="text-xl font-bold mt-4">Welkom! 🎉</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vertel ons over je salon om te beginnen
          </p>
        </div>

        <OnboardingForm userEmail={session.user.email || ""} userId={session.user.id} />

        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Je kunt dit later altijd nog aanpassen in je instellingen
        </p>
      </div>
    </main>
  );
}
