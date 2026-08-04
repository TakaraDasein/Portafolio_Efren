export const prerender = false

import type { APIRoute } from "astro"
import { requireSession } from "../../../lib/auth"
import { listVaultSecrets, addVaultSecret, deleteVaultSecret, type VaultSecret } from "../../../lib/vault-store"

export const GET: APIRoute = async ({ cookies }) => {
  if (!requireSession(cookies)) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 })
  }
  const secrets = await listVaultSecrets()
  return new Response(JSON.stringify({ secrets }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireSession(cookies)) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const label = typeof body?.label === "string" ? body.label.trim() : ""
  const value = typeof body?.value === "string" ? body.value : ""
  const category: VaultSecret["category"] = ["token", "api-key", "password", "other"].includes(body?.category)
    ? body.category
    : "other"
  const notes = typeof body?.notes === "string" ? body.notes.trim() : undefined

  if (!label || !value) {
    return new Response(JSON.stringify({ error: "label y value son obligatorios" }), { status: 400 })
  }

  const secret = await addVaultSecret({ label, value, category, notes })
  return new Response(JSON.stringify({ secret }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  })
}

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!requireSession(cookies)) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : ""
  if (!id) {
    return new Response(JSON.stringify({ error: "id es obligatorio" }), { status: 400 })
  }

  await deleteVaultSecret(id)
  return new Response(null, { status: 204 })
}
