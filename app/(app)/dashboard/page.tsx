import type { Metadata } from "next";
import { DashboardScreen } from "@/components/app/screens/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardScreen />;
}
