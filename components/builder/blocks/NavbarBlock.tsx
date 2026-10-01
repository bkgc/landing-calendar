"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui";
import type { Business } from "@/types/business";
import type { NavbarBlockProps } from "@/types/blocks";

export function NavbarBlock({
  business,
  logoUrl,
  links = [],
  ctaText = "Reservar",
  layout = "spread",
}: NavbarBlockProps & { business: Business }) {
  const isCentered = layout === "centered";
  const isMinimal = layout === "minimal";

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-[var(--landing-background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-5 py-4 lg:px-8">
        <Link
          className="flex min-w-0 items-center gap-3 font-semibold"
          href="#inicio"
        >
          {logoUrl || business.logoUrl ? (
            <Image
              className="size-10 rounded-xl object-cover"
              alt=""
              height={40}
              src={logoUrl || business.logoUrl || ""}
              unoptimized
              width={40}
            />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--landing-primary)] text-sm font-bold text-white">
              {business.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="truncate">{business.name}</span>
        </Link>
        {!isMinimal && links.length ? (
          <nav className={`hidden items-center gap-6 md:flex ${isCentered ? "flex-1 justify-center" : ""}`}>
            {links.map((link) => (
              <Link
                className="text-sm opacity-70 transition-opacity hover:opacity-100"
                href={link.href}
                key={`${link.href}-${link.label}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="hidden items-center gap-4 md:flex">
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
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              aria-label="Abrir menú"
              className="md:hidden"
              variant="flat"
            >
              <Menu size={19} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Navegación">
            <>
              <DropdownItem key="reservar" href="#reservar">
                {ctaText}
              </DropdownItem>
              {links.map((link) => (
                <DropdownItem key={link.href} href={link.href}>
                  {link.label}
                </DropdownItem>
              ))}
            </>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
