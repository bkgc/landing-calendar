"use client";

import Link from "next/link";

import { Button, Card, CardBody } from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-default-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link className="text-xl font-bold tracking-tight" href="/">
          AgendaPro
        </Link>
        <div className="flex gap-2">
          <Button as={Link} href="/login" variant="light">
            Ingresar
          </Button>
          <Button as={Link} color="primary" href="/register">
            Crear mi negocio
          </Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-28">
        <div className="space-y-6">
          <p className="font-medium text-primary">Reservas simples para negocios de servicios</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Tu agenda y tu página de reservas, en un solo lugar.
          </h1>
          <p className="max-w-2xl text-lg text-default-500">
            AgendaPro ayuda a barberías, salones, consultorios y profesionales a recibir reservas sin perder el control de su calendario.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} color="primary" href="/register" size="lg">
              Empezar gratis
            </Button>
            <Button as={Link} href="/login" size="lg" variant="bordered">
              Ya tengo una cuenta
            </Button>
          </div>
        </div>
        <Card className="border border-primary-100 shadow-xl">
          <CardBody className="gap-5 p-7">
            <p className="text-sm font-semibold text-primary">TODO LISTO PARA EMPEZAR</p>
            <div className="space-y-4">
              <p className="text-2xl font-semibold">Crea tu espacio en menos de 3 minutos.</p>
              <p className="text-default-500">Incluye 7 días de prueba para que puedas conocer AgendaPro sin compromiso.</p>
            </div>
            <div className="rounded-2xl bg-primary-50 p-4 text-sm text-primary-700">
              Página pública, servicios, equipo y disponibilidad: centralizados para tu negocio.
            </div>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
