export const prerender = false

import type { APIRoute } from "astro"
import { requireSession } from "../../../lib/auth"
import { revealVaultSecret } from "../../../lib/vault-store"

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireSession(cookies)) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : ""
  if (!id) {
    return new Response(JSON.stringify({ error: "id es obligatorio" }), { status: 400 })
  }

  const value = await revealVaultSecret(id)
  if (value === null) {
    return new Response(JSON.stringify({ error: "No encontrado" }), { status: 404 })
  }

  return new Response(JSON.stringify({ value }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
