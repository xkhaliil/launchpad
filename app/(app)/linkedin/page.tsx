import type { Metadata } from "next";
import { LinkedinScreen } from "@/components/app/screens/linkedin";

export const metadata: Metadata = { title: "LinkedIn" };

export default function Page() {
  return <LinkedinScreen />;
}
