import { defineMiddleware } from "astro:middleware"
import { isValidSessionToken, SESSION_COOKIE_NAME } from "./lib/auth"

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const token = context.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!isValidSessionToken(token)) {
      return context.redirect("/login")
    }
  }

  // API routes report their own JSON errors — a redirect here would break fetch(...).json() callers.
  if (pathname.startsWith("/api/")) {
    return next()
  }

  try {
    return await next()
  } catch (err) {
    const ref = Date.now().toString(36)
    console.error(`[${ref}] SSR error at ${pathname}:`, err)
    return context.redirect(`/error?ref=${ref}`)
  }
})
