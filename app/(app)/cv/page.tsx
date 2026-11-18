import type { Metadata } from "next";
import { CvScreen } from "@/components/app/screens/cv";

export const metadata: Metadata = { title: "CV builder" };

export default function Page() {
  return <CvScreen />;
}
