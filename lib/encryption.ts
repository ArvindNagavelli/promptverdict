import CryptoJS from 'crypto-js'

function getKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY not set in environment variables')
  return key
}

export function encryptApiKey(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, getKey()).toString()
}

export function decryptApiKey(encrypted: string): string {
  return CryptoJS.AES.decrypt(encrypted, getKey()).toString(CryptoJS.enc.Utf8)
}

export function getKeyDisplay(apiKey: string): string {
  if (apiKey.length < 4) return '****'
  return `****${apiKey.slice(-4)}`
}
