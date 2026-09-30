"use client";

import { useEffect } from "react";

import { Button, Card, CardBody } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardBody className="gap-4 p-6">
          <div>
            <h2 className="text-xl font-bold">No pudimos cargar esta página</h2>
            <p className="mt-1 text-sm text-default-500">Inténtalo nuevamente en unos segundos.</p>
          </div>
          <Button className="w-fit" color="primary" onPress={reset}>
            Intentar nuevamente
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
