"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Input, Textarea } from "@heroui/react";
import type { Service } from "@/types/service";

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre."),
  description: z.string().max(500).default(""),
  duration: z.coerce.number().int().min(15, "Mínimo 15 minutos.").max(480),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  bufferTime: z.coerce.number().int().min(0).max(120),
});

type ServiceFormValues = z.output<typeof serviceSchema>;
type ServiceFormInput = z.input<typeof serviceSchema>;

const defaultValues: ServiceFormInput = {
  name: "",
  description: "",
  duration: 60,
  price: 0,
  bufferTime: 0,
};

interface ServiceFormProps {
  onCreated: () => Promise<void>;
  editingService?: Service | null;
  onCancel?: () => void;
}

export function ServiceForm({
  onCreated,
  editingService,
  onCancel,
}: ServiceFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const isEditing = Boolean(editingService);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, undefined, ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  useEffect(() => {
    if (editingService) {
      reset({
        name: editingService.name,
        description: editingService.description || "",
        duration: editingService.duration,
        price: editingService.price,
        bufferTime: editingService.bufferTime || 0,
      });
      setMessage(null);
    } else {
      reset(defaultValues);
    }
  }, [editingService, reset]);

  const submit = async (values: ServiceFormValues) => {
    setMessage(null);
    if (isEditing && editingService) {
      const response = await fetch(
        `/api/business/services/${editingService.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = await response.json();
      setMessage(result.success ? "Servicio actualizado." : result.error);
      if (result.success) {
        reset(defaultValues);
        await onCreated();
        onCancel?.();
      }
    } else {
      const response = await fetch("/api/business/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, staffIds: [], active: true }),
      });
      const result = await response.json();
      setMessage(result.success ? "Servicio guardado." : result.error);
      if (result.success) {
        reset(defaultValues);
        await onCreated();
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <Input
        label="Nombre"
        isInvalid={Boolean(errors.name)}
        errorMessage={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        label="Descripción"
        minRows={3}
        isInvalid={Boolean(errors.description)}
        errorMessage={errors.description?.message}
        {...register("description")}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Duración (min)"
          type="number"
          isInvalid={Boolean(errors.duration)}
          errorMessage={errors.duration?.message}
          {...register("duration")}
        />
        <Input
          label="Precio (BOB)"
          type="number"
          step="0.01"
          isInvalid={Boolean(errors.price)}
          errorMessage={errors.price?.message}
          {...register("price")}
        />
      </div>
      <Input
        label="Buffer entre citas (min)"
        type="number"
        isInvalid={Boolean(errors.bufferTime)}
        errorMessage={errors.bufferTime?.message}
        {...register("bufferTime")}
      />
      <div className="flex gap-2">
        <Button
          color="primary"
          isLoading={isSubmitting}
          startContent={isEditing ? <Check size={17} /> : <Plus size={17} />}
          type="submit"
        >
          {isEditing ? "Guardar cambios" : "Agregar servicio"}
        </Button>
        {isEditing && onCancel ? (
          <Button
            type="button"
            variant="flat"
            startContent={<X size={16} />}
            onPress={() => {
              reset(defaultValues);
              onCancel();
            }}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
      {message ? (
        <p className="text-sm text-[var(--app-primary)]">{message}</p>
      ) : null}
    </form>
  );
}
