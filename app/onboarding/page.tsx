import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user already has a salon
  const existingSalon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  if (existingSalon) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold">
            <span className="text-primary">✂️</span> Clippr
          </span>
          <h1 className="text-xl font-semibold mt-4">Welkom! Laten we je salon opzetten</h1>
          <p className="text-muted-foreground">Dit duurt maar een minuutje</p>
        </div>

        <OnboardingForm userEmail={session.user.email!} userId={session.user.id} />

        <p className="text-center text-xs text-muted-foreground mt-4">
          Je kunt deze gegevens later altijd aanpassen
        </p>
      </div>
    </main>
  );
}
