"use client";

import {
  Button,
  Link,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
  return (
    <HeroNavbar className="border-b border-default-200">
      <NavbarBrand>
        <NextLink className="font-bold" href="/">
          AgendaPro
        </NextLink>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          <Link as={NextLink} color="foreground" href="/login">
            Ingresar
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={NextLink} color="primary" href="/register">
            Empezar gratis
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
};
