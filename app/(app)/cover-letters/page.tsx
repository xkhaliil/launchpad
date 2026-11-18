import type { Metadata } from "next";
import { CoverLettersScreen } from "@/components/app/screens/cover-letters";

export const metadata: Metadata = { title: "Cover letters" };

export default function Page() {
  return <CoverLettersScreen />;
}
