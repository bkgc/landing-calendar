"use client";

import { Check, RefreshCw, X } from "lucide-react";

import { Button, Chip, Input } from "@/components/ui";
import { formatBusinessTime } from "@/lib/utils/date";
import type { Appointment } from "@/types/appointment";

const labels: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No asistió",
};

const colors: Record<string, "success" | "danger" | "primary" | "default"> = {
  confirmed: "success",
  cancelled: "danger",
  completed: "primary",
  no_show: "default",
};

interface AppointmentTableProps {
  appointments: Appointment[];
  reschedule: Record<string, string>;
  onStatusChange: (id: string, status: string) => void;
  onRescheduleChange: (id: string, value: string) => void;
  onMove: (appointment: Appointment) => void;
}

export function AppointmentTable({
  appointments,
  reschedule,
  onStatusChange,
  onRescheduleChange,
  onMove,
}: AppointmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-[var(--app-canvas)] text-xs uppercase text-[var(--app-muted)]">
          <tr>
            <th className="px-5 py-3">Hora</th>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr
              key={appointment.id}
              className="border-t border-[var(--app-line)]"
            >
              <td className="px-5 py-4 font-semibold">
                {formatBusinessTime(appointment.start)} -{" "}
                {formatBusinessTime(appointment.end)}
              </td>
              <td className="px-5 py-4">
                <p className="font-medium">{appointment.clientName}</p>
                <p className="text-xs text-[var(--app-muted)]">
                  {appointment.clientPhone}
                </p>
              </td>
              <td className="px-5 py-4">
                <Chip
                  color={colors[appointment.status] || "default"}
                  size="sm"
                  variant="flat"
                >
                  {labels[appointment.status] || appointment.status}
                </Chip>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {appointment.status === "confirmed" ? (
                    <>
                      <Button
                        color="danger"
                        size="sm"
                        startContent={<X size={14} />}
                        variant="light"
                        onPress={() =>
                          onStatusChange(appointment.id, "cancelled")
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        startContent={<Check size={14} />}
                        variant="flat"
                        onPress={() =>
                          onStatusChange(appointment.id, "completed")
                        }
                      >
                        Completar
                      </Button>
                      <Input
                        aria-label="Nueva fecha y hora"
                        className="w-48"
                        type="datetime-local"
                        value={reschedule[appointment.id] || ""}
                        onValueChange={(value) =>
                          onRescheduleChange(appointment.id, value)
                        }
                      />
                      <Button
                        size="sm"
                        startContent={<RefreshCw size={14} />}
                        variant="bordered"
                        onPress={() => onMove(appointment)}
                      >
                        Mover
                      </Button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
