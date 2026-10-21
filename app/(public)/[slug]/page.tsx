import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { getPublicBusiness } from "@/lib/server/public-business";
import { getLandingFontStack } from "@/types/blocks";

export const revalidate = 60;

interface PublicBusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicBusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicBusiness(slug);
  if (!result) {
    return { title: "AgendaPro" };
  }

  return {
    title: result.business.seoTitle || result.business.name,
    description:
      result.business.seoDescription ||
      `Reserva tu cita en ${result.business.name}.`,
    icons: result.business.faviconUrl
      ? { icon: result.business.faviconUrl }
      : undefined,
  };
}

export default async function PublicBusinessPage({
  params,
}: PublicBusinessPageProps) {
  const { slug } = await params;
  const result = await getPublicBusiness(slug);
  if (!result) {
    notFound();
  }

  const isFreePlan =
    result.business.plan === "free" ||
    result.business.subscriptionStatus !== "active";

  const sanitizedPixelId = result.business.facebookPixel
    ? result.business.facebookPixel.replace(/[^a-zA-Z0-9_-]/g, "")
    : null;

  return (
    <main
      style={
        {
          "--landing-primary": result.config.theme.primary,
          "--landing-background": result.config.theme.background,
          "--landing-foreground": result.config.theme.foreground,
          "--landing-font": getLandingFontStack(result.config.theme.font),
          "--landing-radius":
            result.config.theme.radius === "sm"
              ? "8px"
              : result.config.theme.radius === "md"
                ? "14px"
                : result.config.theme.radius === "full"
                  ? "999px"
                  : "22px",
        } as React.CSSProperties
      }
      className="min-h-screen bg-[var(--landing-background)] text-[var(--landing-foreground)] [font-family:var(--landing-font)]"
    >
      {sanitizedPixelId ? (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${sanitizedPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      <BlockRenderer
        business={result.business}
        businessHours={result.businessHours}
        config={result.config}
        services={result.services}
        staff={result.staff}
      />

      {isFreePlan ? (
        <footer className="border-t border-black/10 bg-black/[0.02] py-6 text-center text-xs opacity-85">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 font-medium shadow-xs transition hover:scale-105 hover:shadow-sm"
          >
            <span>
              ⚡ Hecho con{" "}
              <strong className="font-semibold text-[var(--landing-primary)]">
                AgendaPro
              </strong>
            </span>
            <span className="opacity-40">·</span>
            <span className="opacity-75 underline underline-offset-2">
              Crea tu agenda gratis
            </span>
          </Link>
        </footer>
      ) : null}
    </main>
  );
}
