import type { Metadata } from "next";
import { WebsiteScreen } from "@/components/app/screens/website";

export const metadata: Metadata = { title: "Website" };

export default function Page() {
  return <WebsiteScreen />;
}
