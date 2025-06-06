import type QUnit from 'qunit'
import * as env from './env.js'
import type * as jose from '../src/index.js'
import * as roundtrip from './sign.js'

export default (
  QUnit: QUnit,
  lib: typeof jose,
  keys: Pick<typeof jose, 'exportJWK' | 'generateKeyPair' | 'generateSecret' | 'importJWK'>,
) => {
  const { module, test } = QUnit
  module('jws.ts')

  type Vector = [string, boolean] | [string, boolean, jose.GenerateKeyPairOptions]
  const algorithms: Vector[] = [
    ['Ed25519', !env.isBlink],
    ['EdDSA', !env.isBlink],
    ['ES256', true],
    ['ES384', true],
    ['ES512', !env.isDeno],
    ['PS256', true],
    ['PS384', true],
    ['PS512', true],
    ['RS256', true],
    ['RS384', true],
    ['RS512', true],
  ]

  const kps: Record<string, jose.GenerateKeyPairResult> = {}

  function title(vector: Vector) {
    const [alg, works, options] = vector
    let result = ''
    if (!works) {
      result = '[not supported] '
    }
    result += `${alg}`
    if (options) {
      result += `, ${JSON.stringify(options)}`
    }
    return result
  }

  for (const vector of algorithms) {
    const [alg, works, options] = vector
    const k = options?.crv || alg

    const execute = async (t: typeof QUnit.assert) => {
      if (!kps[k]) {
        kps[k] = await keys.generateKeyPair(alg, { ...options, extractable: true })
      }
      await roundtrip.jws(t, lib, keys, alg, kps[k])
    }

    const jwt = async (t: typeof QUnit.assert) => {
      if (!kps[k]) {
        kps[k] = await keys.generateKeyPair(alg, { ...options, extractable: true })
      }
      await roundtrip.jwt(t, lib, keys, alg, kps[k])
    }

    if (works) {
      test(title(vector), execute)
      test(`${title(vector)} JWT`, jwt)
    } else {
      test(title(vector), async (t) => {
        await t.rejects(execute(t))
      })
    }
  }
}
