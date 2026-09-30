"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Divider, Input } from "@/components/ui";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getFirebaseAuth } from "@/lib/firebase/config";

const registerSchema = z
  .object({
    email: z.string().email("Ingresa un correo válido."),
    name: z.string().trim().min(2, "Ingresa tu nombre."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirmation"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setError(null);

    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        values.email,
        values.password,
      );
      await updateProfile(credential.user, { displayName: values.name });
      router.replace("/onboarding");
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    }
  };

  const signUpWithGoogle = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      router.replace("/onboarding");
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <Button isLoading={isGoogleLoading} type="button" variant="bordered" onPress={signUpWithGoogle}>
        Registrarme con Google
      </Button>
      <Divider />
      <Input
        isInvalid={Boolean(form.formState.errors.name)}
        label="Tu nombre"
        {...form.register("name")}
        errorMessage={form.formState.errors.name?.message}
      />
      <Input
        isInvalid={Boolean(form.formState.errors.email)}
        label="Correo electrónico"
        type="email"
        {...form.register("email")}
        errorMessage={form.formState.errors.email?.message}
      />
      <Input
        isInvalid={Boolean(form.formState.errors.password)}
        label="Contraseña"
        type="password"
        {...form.register("password")}
        errorMessage={form.formState.errors.password?.message}
      />
      <Input
        isInvalid={Boolean(form.formState.errors.passwordConfirmation)}
        label="Confirma tu contraseña"
        type="password"
        {...form.register("passwordConfirmation")}
        errorMessage={form.formState.errors.passwordConfirmation?.message}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button color="primary" isLoading={form.formState.isSubmitting} type="submit">
        Crear mi cuenta
      </Button>
      <p className="text-center text-sm text-default-500">
        ¿Ya tienes una cuenta?{" "}
        <Link className="font-medium text-primary" href="/login">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
