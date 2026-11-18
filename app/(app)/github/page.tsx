import type { Metadata } from "next";
import { Suspense } from "react";
import { GithubScreen } from "@/components/app/screens/github";

export const metadata: Metadata = { title: "GitHub" };

export default function Page() {
  return (
    <Suspense>
      <GithubScreen />
    </Suspense>
  );
}
