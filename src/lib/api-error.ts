export function jsonServerError(context: string, err: unknown): Response {
  const ref = Date.now().toString(36)
  console.error(`[${ref}] ${context}:`, err)
  return new Response(JSON.stringify({ error: "Error interno", ref }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  })
}
