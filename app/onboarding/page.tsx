import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const existingSalon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });
  if (existingSalon) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center p-6 gradient-subtle relative overflow-hidden">
      <div className="absolute top-20 right-20 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <span className="inline-block text-3xl font-bold tracking-tight mb-3">
            <span className="gradient-text">✂️ Clippr</span>
          </span>
          <h1 className="text-xl font-bold">Welkom! Laten we je salon opzetten</h1>
          <p className="text-muted-foreground mt-1">Dit duurt maar een minuutje</p>
        </div>
        <OnboardingForm userEmail={session.user.email!} userId={session.user.id} />
        <p className="text-center text-xs text-muted-foreground mt-4">Je kunt deze gegevens later altijd aanpassen</p>
      </div>
    </main>
  );
}
