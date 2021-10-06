import crypto, { isCryptoKey } from './webcrypto.ts'
import type { JWKExportFunction } from './interfaces.d.ts'
import type { JWK } from '../types.d.ts'
import invalidKeyInput from './invalid_key_input.ts'
import { encode as base64url } from './base64url.ts'

const keyToJWK: JWKExportFunction = async (key: unknown): Promise<JWK> => {
  if (key instanceof Uint8Array) {
    return {
      kty: 'oct',
      k: base64url(key),
    }
  }
  if (!isCryptoKey(key)) {
    throw new TypeError(invalidKeyInput(key, 'CryptoKey', 'Uint8Array'))
  }
  if (!key.extractable) {
    throw new TypeError('non-extractable CryptoKey cannot be exported as a JWK')
  }
  const { ext, key_ops, alg, use, ...jwk } = await crypto.subtle.exportKey('jwk', key)

  return <JWK>jwk
}
export default keyToJWK
