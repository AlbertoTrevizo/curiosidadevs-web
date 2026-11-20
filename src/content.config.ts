import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const dias = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/dias" }),
  schema: z.object({
    dia: z.number(),
    tema: z.string(),
    modo: z.string().optional(),
    que_es: z.tuple([z.string(), z.string()]),
    ejercicios: z.array(z.object({
      titulo: z.string(),
      nivel: z.enum(["facil", "medio", "reto"]),
      codigo: z.string(),
      ancho: z.boolean().optional(),
      salida: z.string().optional(),
      prueba: z.string().optional(),
      entrada: z.string().optional(),
      editor: z.boolean().optional(),
    })),
  }),
});

const guias = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/guias" }),
  schema: z.object({ titulo: z.string(), descripcion: z.string(), fecha: z.coerce.date() }),
});

export const collections = { dias, guias };
