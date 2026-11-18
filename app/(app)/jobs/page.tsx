import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsScreen } from "@/components/app/screens/jobs";

export const metadata: Metadata = { title: "Job ads" };

export default function Page() {
  return (
    <Suspense>
      <JobsScreen />
    </Suspense>
  );
}
