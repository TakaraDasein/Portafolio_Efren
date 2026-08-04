import { put, get } from "@vercel/blob"
import { encrypt, decrypt } from "./vault-crypto"

export interface VaultSecret {
  id: string
  label: string
  value: string
  category: "token" | "api-key" | "password" | "other"
  notes?: string
  createdAt: string
}

export interface VaultSecretMasked {
  id: string
  label: string
  masked: string
  category: VaultSecret["category"]
  notes?: string
  createdAt: string
}

const VAULT_PATHNAME = "vault/secrets.json.enc"

// The Vercel Blob store for this project was connected with the custom prefix
// "BLOB_READ_WRITE_TOKEN", so Vercel actually named the token env var
// "BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN" (prefix + "_READ_WRITE_TOKEN"), not the
// plain "BLOB_READ_WRITE_TOKEN" that @vercel/blob looks for automatically.
function getBlobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN
}

export function maskValue(value: string): string {
  if (value.length <= 4) return "•".repeat(value.length)
  return `${"•".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`
}

async function readEncryptedBlob(): Promise<string | null> {
  try {
    const result = await get(VAULT_PATHNAME, { access: "private", useCache: false, token: getBlobToken() })
    if (!result || !result.stream) return null
    return await new Response(result.stream).text()
  } catch {
    return null
  }
}

export async function loadVault(): Promise<VaultSecret[]> {
  const encrypted = await readEncryptedBlob()
  if (!encrypted) return []
  try {
    return JSON.parse(decrypt(encrypted)) as VaultSecret[]
  } catch {
    return []
  }
}

async function saveVault(secrets: VaultSecret[]): Promise<void> {
  const encrypted = encrypt(JSON.stringify(secrets))
  await put(VAULT_PATHNAME, encrypted, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/plain",
    token: getBlobToken(),
  })
}

export function toMasked(secret: VaultSecret): VaultSecretMasked {
  return {
    id: secret.id,
    label: secret.label,
    masked: maskValue(secret.value),
    category: secret.category,
    notes: secret.notes,
    createdAt: secret.createdAt,
  }
}

export async function listVaultSecrets(): Promise<VaultSecretMasked[]> {
  const secrets = await loadVault()
  return secrets.map(toMasked)
}

export async function addVaultSecret(
  input: Omit<VaultSecret, "id" | "createdAt">,
): Promise<VaultSecretMasked> {
  const secrets = await loadVault()
  const secret: VaultSecret = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  secrets.push(secret)
  await saveVault(secrets)
  return toMasked(secret)
}

export async function deleteVaultSecret(id: string): Promise<void> {
  const secrets = await loadVault()
  await saveVault(secrets.filter((s) => s.id !== id))
}

export async function revealVaultSecret(id: string): Promise<string | null> {
  const secrets = await loadVault()
  return secrets.find((s) => s.id === id)?.value ?? null
}
