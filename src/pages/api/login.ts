export const prerender = false

import type { APIRoute } from "astro"
import { checkPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "../../lib/auth"

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData()
  const password = String(form.get("password") ?? "")

  if (!password || !checkPassword(password)) {
    return redirect("/login?error=1")
  }

  cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return redirect("/dashboard")
}
