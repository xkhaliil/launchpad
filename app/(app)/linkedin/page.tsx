import type { Metadata } from "next";
import { LinkedinScreen } from "@/components/app/screens/linkedin";

export const metadata: Metadata = { title: "LinkedIn studio" };

export default function Page() {
  return <LinkedinScreen />;
}
