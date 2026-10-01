import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui";
import type { FooterBlockProps } from "@/types/blocks";
import type { Business } from "@/types/business";

export function FooterBlock({
  business,
  description = "Reserva cuando te quede bien.",
  ctaText = "Reservar",
}: FooterBlockProps & { business: Business }) {
  return (
    <footer className="px-5 py-10 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">{business.name}</p>
          <p className="mt-1 text-sm opacity-60">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {business.plan === "free" ? (
            <span className="text-xs opacity-55">Hecho con AgendaPro</span>
          ) : null}
          <Button
            as={Link}
            color="primary"
            endContent={<ArrowUpRight size={15} />}
            href="#reservar"
            size="sm"
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </footer>
  );
}
