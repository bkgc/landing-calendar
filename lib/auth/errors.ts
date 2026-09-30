import { FirebaseError } from "firebase/app";

const authErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "Este correo ya tiene una cuenta.",
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Ingresa un correo electrónico válido.",
  "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de completar el acceso.",
  "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return authErrorMessages[error.code] ?? "No pudimos completar la acción. Inténtalo nuevamente.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado. Inténtalo nuevamente.";
}
