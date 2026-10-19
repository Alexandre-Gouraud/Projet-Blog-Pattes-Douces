import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-[#996C44]">Page introuvable</h1>
      <p className="text-[#444444]">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link
        href={ROUTES.feed}
        className="bg-[#FFB371] text-white px-4 py-2 rounded-lg hover:bg-[#996C44] transition-colors"
      >
        Retour au fil d&apos;actualité
      </Link>
    </div>
  );
}
