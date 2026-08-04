import { createHmac, timingSafeEqual } from "node:crypto"

export const SESSION_COOKIE_NAME = "dashboard_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 días

function getSecret(): string {
  const secret = import.meta.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET no está configurado en las variables de entorno")
  }
  return secret
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function sign(value: string): string {
  const hmac = createHmac("sha256", getSecret()).update(value).digest("hex")
  return `${value}.${hmac}`
}

export function createSessionToken(): string {
  return sign(`ok:${Date.now()}`)
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false
  const dotIndex = token.lastIndexOf(".")
  if (dotIndex === -1) return false
  const value = token.slice(0, dotIndex)
  const providedHmac = token.slice(dotIndex + 1)
  const expectedHmac = createHmac("sha256", getSecret()).update(value).digest("hex")
  return safeEqual(providedHmac, expectedHmac)
}

export function checkPassword(password: string): boolean {
  const expected = import.meta.env.DASHBOARD_PASSWORD
  if (!expected) {
    throw new Error("DASHBOARD_PASSWORD no está configurado en las variables de entorno")
  }
  return safeEqual(password, expected)
}

export function requireSession(cookies: { get: (name: string) => { value: string } | undefined }): boolean {
  return isValidSessionToken(cookies.get(SESSION_COOKIE_NAME)?.value)
}
