import { Suspense } from "react";
import {
  Account,
  AuthButtons,
  MobileAccount,
  MobileAuthLinks,
} from "@/components/landing/account";
import { Evaluation } from "@/components/landing/evaluation";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Modules } from "@/components/landing/modules";
import { Principles } from "@/components/landing/principles";
import { ScrollMotion } from "@/components/landing/scroll-motion";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Statement } from "@/components/landing/statement";

export default function Home() {
  return (
    <>
      <SiteHeader
        account={
          <Suspense fallback={<AuthButtons />}>
            <Account />
          </Suspense>
        }
        mobileAccount={
          <Suspense fallback={<MobileAuthLinks />}>
            <MobileAccount />
          </Suspense>
        }
      />
      <main id="main" className="flex-1">
        <Hero />
        <ScrollMotion>
          <Statement />
          <Modules />
          <Evaluation />
          <HowItWorks />
          <Principles />
          <FinalCta />
        </ScrollMotion>
      </main>
      <ScrollMotion>
        <SiteFooter />
      </ScrollMotion>
    </>
  );
}
