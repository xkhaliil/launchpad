import type { Metadata } from "next";
import { WebsiteScreen } from "@/components/app/screens/website";

export const metadata: Metadata = { title: "Personal website" };

export default function Page() {
  return <WebsiteScreen />;
}
