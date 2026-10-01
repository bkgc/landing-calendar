import { Avatar, Card, CardBody } from "@heroui/react";

import type { StaffBlockProps } from "@/types/blocks";
import type { StaffMember } from "@/types/staff";

export function StaffBlock({
  staff,
  title = "Nuestro equipo",
  subtitle = "Personas listas para atenderte.",
  columns = 3,
  align = "left",
}: StaffBlockProps & { staff: StaffMember[] }) {
  if (!staff.length) return null;

  const isCentered = align === "center";
  const gridColsClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-3";

  return (
    <section className="space-y-6 px-5 py-16">
      <div className={isCentered ? "text-center mx-auto max-w-2xl" : "text-left"}>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-sm opacity-65">{subtitle}</p>
      </div>
      <div className={`grid gap-4 ${gridColsClass}`}>
        {staff.map((member) => (
          <Card key={member.id}>
            <CardBody className="items-center gap-3 p-5 text-center">
              <Avatar
                className="h-20 w-20"
                src={member.avatar}
                name={member.name}
              />
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm opacity-70">{member.role}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
