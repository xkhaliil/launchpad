import type { Metadata } from "next";
import { EvaluationScreen } from "@/components/app/screens/evaluation";

export const metadata: Metadata = { title: "Full evaluation" };

export default function Page() {
  return <EvaluationScreen />;
}
