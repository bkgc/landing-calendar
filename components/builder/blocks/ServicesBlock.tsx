import { Clock3 } from "lucide-react";

import { Card, CardBody, Chip } from "@/components/ui";
import type { ServicesBlockProps } from "@/types/blocks";
import type { Service } from "@/types/service";

export function ServicesBlock({
  services,
  title = "Elige lo que necesitas",
  subtitle = "Horarios claros, precios transparentes y una reserva sin vueltas.",
  columns = 3,
  align = "left",
}: ServicesBlockProps & { services: Service[] }) {
  const isCentered = align === "center";
  const gridColsClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      className="border-b border-black/10 px-5 py-16 md:py-20 lg:px-8"
      id="servicios"
    >
      <div className="mx-auto max-w-[1280px] space-y-8">
        <div
          className={`flex flex-col justify-between gap-3 ${
            isCentered
              ? "items-center text-center sm:items-center"
              : "sm:flex-row sm:items-end"
          }`}
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--landing-primary)]">
              Servicios
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {title}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 opacity-65">{subtitle}</p>
        </div>
        <div className={`grid gap-4 ${gridColsClass}`}>
          {services.length ? (
            services.map((service) => (
              <Card
                className="border border-black/10 bg-transparent shadow-none transition-transform hover:-translate-y-1"
                key={service.id}
                radius="lg"
              >
                <CardBody className="gap-6 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {service.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-65">
                        {service.description ||
                          "Un servicio pensado para que salgas sintiéndote bien."}
                      </p>
                    </div>
                    <Chip color="primary" size="sm" variant="flat">
                      {service.price.toFixed(2)} BOB
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-65">
                    <Clock3 size={15} />
                    {service.duration} minutos
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <p className="text-sm opacity-65">
              Pronto publicaremos nuestros servicios.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
