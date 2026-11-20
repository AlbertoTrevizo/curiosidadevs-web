// Recibe el formulario de /donar, crea una sesión de Stripe Checkout y redirige a ella.
import type { APIRoute } from "astro";
import { STRIPE_SECRET_KEY } from "astro:env/server";

export const prerender = false;

const MONEDA = "usd";
const MIN = 1, MAX = 1000;

function monto(form: FormData): number | null {
  const n = Number(form.get("otro") || form.get("monto")); // si escribió otra cantidad, esa gana
  return Number.isFinite(n) && n >= MIN && n <= MAX ? Math.round(n * 100) : null;
}

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const centavos = monto(await request.formData());
  if (centavos === null) return new Response(`Elige una cantidad entre ${MIN} y ${MAX} USD.`, { status: 400 });
  if (!STRIPE_SECRET_KEY) return new Response("Las donaciones aún no están configuradas.", { status: 503 });

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    body: new URLSearchParams({
      mode: "payment",
      submit_type: "donate",
      locale: "es-419",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": MONEDA,
      "line_items[0][price_data][unit_amount]": String(centavos),
      "line_items[0][price_data][product_data][name]": "Donación a Curiosida.devs",
      success_url: new URL("/donar/gracias/", url).href,
      cancel_url: new URL("/donar/", url).href,
    }),
  });
  const sesion = await r.json();
  if (!r.ok) {
    console.error("Stripe:", sesion.error?.message);
    return new Response("No se pudo iniciar el pago. Intenta de nuevo en un momento.", { status: 502 });
  }
  return redirect(sesion.url, 303);
};
