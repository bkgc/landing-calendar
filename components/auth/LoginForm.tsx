"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Divider, Input } from "@/components/ui";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/firestore";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const redirectAfterAuthentication = async (userId: string) => {
    const profile = await getUserProfile(userId);
    router.replace(profile?.onboardingCompleted ? nextPath : "/onboarding");
  };

  const onSubmit = async (values: LoginValues) => {
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), values.email, values.password);
      await redirectAfterAuthentication(credential.user.uid);
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const credential = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      await redirectAfterAuthentication(credential.user.uid);
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <Button isLoading={isGoogleLoading} type="button" variant="bordered" onPress={signInWithGoogle}>
        Continuar con Google
      </Button>
      <Divider />
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
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button color="primary" isLoading={form.formState.isSubmitting} type="submit">
        Ingresar a AgendaPro
      </Button>
      <p className="text-center text-sm text-default-500">
        ¿Aún no tienes una cuenta?{" "}
        <Link className="font-medium text-primary" href="/register">
          Crea tu negocio
        </Link>
      </p>
    </form>
  );
}
