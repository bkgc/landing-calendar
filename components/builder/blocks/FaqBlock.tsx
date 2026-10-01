import { Accordion, AccordionItem } from "@heroui/react";

import type { FaqBlockProps } from "@/types/blocks";

export function FaqBlock({
  title = "Preguntas frecuentes",
  items = [],
}: FaqBlockProps) {
  if (!items.length) return null;
  return (
    <section className="space-y-5 px-5 py-16">
      <h2 className="text-3xl font-bold">{title}</h2>
      <Accordion>
        {items.map((item) => (
          <AccordionItem key={item.question} title={item.question}>
            {item.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
