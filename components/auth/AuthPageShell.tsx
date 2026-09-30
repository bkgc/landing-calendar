import Link from "next/link";

interface AuthPageShellProps {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}

export function AuthPageShell({ children, subtitle, title }: AuthPageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-default-200 bg-content1 shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <Link className="text-xl font-bold tracking-tight" href="/">
            AgendaPro
          </Link>
          <div className="space-y-3">
            <p className="text-3xl font-semibold leading-tight">Tu negocio, listo para recibir reservas.</p>
            <p className="max-w-sm text-primary-foreground/80">
              Crea una presencia profesional y administra tu agenda desde un solo lugar.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/70">Hecho para negocios de servicios.</p>
        </div>
        <div className="p-6 sm:p-10">
          <Link className="mb-10 block text-lg font-bold lg:hidden" href="/">
            AgendaPro
          </Link>
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-default-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
