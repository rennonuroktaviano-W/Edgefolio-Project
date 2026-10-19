import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelSkeleton } from "@/components/app/skeleton";
import { RecapCard } from "@/components/app/recaps/recap-card";
import { getRecap } from "@/lib/recaps/queries";

type Params = { params: Promise<{ id: string }> };

export const instant = false;

export const metadata = {
  title: "Recap — Edgefolio",
  description: "A public trade recap.",
};

async function RecapDetail({ id }: { id: string }) {
  const recap = await getRecap(id);
  if (!recap) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/explore"
        transitionTypes={["nav-back"]}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <span aria-hidden="true">←</span> Back to Explore
      </Link>
      <div className="mt-5">
        <RecapCard recap={recap} />
      </div>
    </div>
  );
}

export default async function RecapPage({ params }: Params) {
  const { id } = await params;
  return (
    <Suspense fallback={<PanelSkeleton height="h-80" />}>
      <RecapDetail id={id} />
    </Suspense>
  );
}
