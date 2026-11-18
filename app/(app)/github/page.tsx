import type { Metadata } from "next";
import { GithubScreen } from "@/components/app/screens/github";

export const metadata: Metadata = { title: "GitHub" };

export default function Page() {
  return <GithubScreen />;
}
