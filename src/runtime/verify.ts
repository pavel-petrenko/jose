import type { CryptoKey } from '../types.d.ts'
import subtleAlgorithm from './subtle_dsa.js'

import checkKeyLength from './check_key_length.js'
import getVerifyKey from './get_sign_verify_key.js'

export default async function verify(
  alg: string,
  key: CryptoKey | Uint8Array,
  signature: Uint8Array,
  data: Uint8Array,
) {
  const cryptoKey = await getVerifyKey(alg, key, 'verify')
  checkKeyLength(alg, cryptoKey)
  const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm)
  try {
    return await crypto.subtle.verify(algorithm, cryptoKey, signature, data)
  } catch {
    return false
  }
}
