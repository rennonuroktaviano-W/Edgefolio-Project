import { Hero } from "@/components/hero";
import { ProductPreview } from "@/components/product-preview";
import { SiteFooter } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        <Hero />
        <ProductPreview />
      </main>
      <SiteFooter />
    </div>
  );
}
