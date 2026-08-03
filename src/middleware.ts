import { defineMiddleware } from "astro:middleware"
import { isValidSessionToken, SESSION_COOKIE_NAME } from "./lib/auth"

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const token = context.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!isValidSessionToken(token)) {
      return context.redirect("/login")
    }
  }

  return next()
})
