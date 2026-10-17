import { AppSessionRedirect } from "@/components/auth/app-session-redirect";
import { Hero } from "@/components/hero";
import { ProductPreview } from "@/components/product-preview";
import { TradingCalendar } from "@/components/trading-calendar";
import { TradingPsychology } from "@/components/trading-psychology";
import { RiskManagement } from "@/components/risk-management";
import { ImportHistory } from "@/components/import-history";
import { BrandManifesto } from "@/components/brand-manifesto";
import { SiteFooter } from "@/components/footer";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <AppSessionRedirect />
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <main className="flex-1">
        <Hero />
        <ProductPreview />
        <TradingCalendar />
        <TradingPsychology />
        <RiskManagement />
        <ImportHistory />
        <BrandManifesto />
      </main>
      <SiteFooter />
    </div>
  );
}
