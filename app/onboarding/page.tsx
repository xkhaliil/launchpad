import type { Metadata } from "next";
import { OnboardingScreen } from "@/components/app/screens/onboarding";

export const metadata: Metadata = { title: "Get started" };

export default function Page() {
  return <OnboardingScreen />;
}
